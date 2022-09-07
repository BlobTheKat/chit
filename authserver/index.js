import { WebSocketServer } from 'ws'
import fetch from 'node-fetch'
import {promises as fs, exists} from 'fs'
import * as messages from './messages.js'
import {maketoken, verify} from "./signatures.js"
import nodemailer from "nodemailer"
import { words } from './words.js'
for(let i = 0; i < 256; i++)exists('./users/'+i, a=>a||fs.mkdir('./users/'+i))
let hash = -1, mask = 0
for(const l of (await fetch('https://chit.cf/authservers.txt').then(a=>a.text())).split('\n')){
	if(l.split(' ')[1] == process.argv[2]){
		const [a, b] = l.split(' ',1)[0].split('/')
		mask = 32 - b; hash = parseInt(a, 16) >>> mask
		break
	}
}
if(hash == -1)throw "Could not find server "+process.argv[2]+" in authservers.txt"
const server = new WebSocketServer({port: +process.argv[2].split(':')[1] || 81})

const crcTable = Array.from({length:256},(_,n) => {let c = n;for(let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));return c})
function crc32(str){
	let crc = -1, len = str.length, i = 0
	while(i < len)crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i++)) & 0xFF]
	return ~crc
}
const conns = new Map()
Set.prototype.toJSON = () => {}
const user_regex = /@[a-zA-Z][a-zA-Z0-9_]+$/y
const json = a => a[0] == '.' ? null : JSON.parse(a+'')
server.on('connection', async (ws, {url}) => {
	try{
		const [user, token] = url.slice(1).split('/').map(decodeURIComponent)
		user_regex.lastIndex = 0
		const crc = crc32(user)
		if(crc >>> mask != hash || !user_regex.test(user))return ws.send('"Invalid username!"'),ws.close()
		ws.id = user
		if(token == '/'){
			const {email} = await (conns.get(user) || fs.readFile(`./users/${crc&0xff}/${user}`).then(json))
			ws.email = email
			ws.code = ''
			const [a, b] = email.split('@')
			ws.send('.' + (a.length > 6 ? a.slice(0,2) + '*'.repeat(a.length - 3) + a[a.length - 1] : a.length > 4 ? a[0] + '*'.repeat(a.length - 1) : '****') + '@' + b)
			ws.on('message', msg2)
			return
		}else if(token[0] == '.'){
			try{
				if((await fs.readFile(`./users/${crc&0xff}/${user}`)).toString()!=token){
					ws.send('"Username taken"');return ws.close()
				}
				if(await (await fetch('https://invites.chit.cf/' + encodeURIComponent(token))).text() == 'false')return ws.send('"Invalid invite code"'),ws.close()
			}catch{
				if(await (await fetch('https://invites.chit.cf/' + encodeURIComponent(token))).text() == 'false')return ws.send('"Invalid invite code"'),ws.close()
				await fs.writeFile(`./users/${crc&0xff}/${user}`, token)
			}
			ws.send('.')
			ws.code = ''
			ws.email = ''
			ws.token = token.slice(1)
			ws.on('message', msg2)
			return
		}
		if(!await verify(user, token))return ws.close()
		ws.data = await conns.get(user)
		if(!ws.data){
			const p = fs.readFile(`./users/${crc&0xff}/${user}`).then(json)
			conns.set(user, p)
			conns.set(user, ws.data = await p)
			if(!ws.data)return ws.send('""'),ws.close()
			;(ws.data.sockets = new Set).saving = 0
		}
		ws.send(JSON.stringify(ws.data))
		const set = ws.data.sockets
		if(set.saving == 1)set.saving = 2
		set.add(ws)
		ws.cbs = []
		ws.on('message', msg)
		ws.on('close', closed)
	}catch(e){console.log(e);return ws.close()}
})
server.on('listening', () => console.log('Listening on :'+server.address().port))
const clear = '\x1b[3J\x1bc'
async function closed(){
	if(!this.data)return
	const set = this.data.sockets
	set.delete(this)
	if(!set.size){
		const path = `./users/${crc32(this.id)&0xff}/${this.id}`
		do{
			set.saving = 1
			await fs.writeFile(path, JSON.stringify(this.data))
		}while(set.saving == 2)
		conns.delete(this.id)
	}
}
const ar = ['', '']
String.prototype.split1 = function(a){
	let i = this.indexOf(a)
	if(i < 0)i = this.length
	ar[1] = this.slice(i + 1)
	ar[0] = this.slice(0, i)
	return ar
}
async function msg(d){
	const [code, data] = d.toString().split1('\n')
	const fn = messages[code]
	if(!fn)return
	this.cbs.push(fn, data)
	if(this.cbs.length == 2){
		for(let i = 0; i < this.cbs.length; i += 2)await this.cbs[i].call(this, this.data, this.cbs[i + 1])
		this.cbs.length = 0
	}
}
let testAccount = await nodemailer.createTestAccount();

let transporter = nodemailer.createTransport({
	host: "smtp.ethereal.email",
	port: 587,
	secure: false,
	auth: testAccount,
});

// send mail with defined transport object
const mail = (d, subject, html) => transporter.sendMail({
	from: '"Chit.gg" <noreply@chit.gg>', to: d, subject, html
})
async function msg2(d){d = d.toString()
	if(d[0] == '.'){
		if(this.token){
			if(this.email)return
			if(!/\.[^@]+@([a-zA-Z0-9\-]+\.)+[a-zA-Z0-9]{2,24}/.test(d))return this.send('Invalid email')
			if(d.endsWith('@example.com'))return this.send('Haha very funny')
		}
		d = d.slice(1)
		if(!this.token)if(this.email != d)return this.send(''), this.code = '-'
		const r = Math.floor(Math.random() * 1000000)
		this.code = words[r % 1000] + '-' + words[Math.floor(r / 1000)]
		this.email = d
		mail(d, "Email verification", "<style>body *{width:100%;text-align:center}@font-face{font-family:a;src:url(https://fonts.gstatic.com/s/ubuntu/v20/4iCv6KVjbNBYlgoCjC3jsGyNPYZvgw.woff2)}body{padding:max(50px, calc(50vh - 120px)) 0;margin:0;background:linear-gradient(#0006,#0006), url(https://chit.cf/img/creo"+(r%8)+".png) center/cover;color:#fff;font-family:a;font-size:20px;text-shadow:0 0 5px #0006;text-align:center}</style><h2>Finish signing up</h2>If this wasn't you, you can safely ignore this email.<br><br>Otherwise, your code is<div style='white-space:pre-wrap;font-size:1.2em;width:100%;backdrop-filter:blur(10px);margin-top:30px;padding:10px;background:#0001'>"+this.code+"</div>").then(a => console.log(nodemailer.getTestMessageUrl(a)))
		this.send('')
	}else if(this.code){
		if(d == this.code && d.length > 5){
			//accept account with ws.email
			if(this.token){
				const res = await (await fetch('https://invites.chit.cf/' + encodeURIComponent(this.token))).text()
				if(res == 'false')return ws.send('"Invite code has been used"'),ws.close()
				await fs.writeFile(`./users/${crc32(this.id)&0xff}/${this.id}`, `{"bits":3,"email":${JSON.stringify(this.email)},"lastsign":0,"signature":"","icon":"","guilds":[]}`)
			}
			this.code = this.email = ''
			this.send('.' + await maketoken(this.id))
			this.close()
		}else this.send('Invalid code!')
	}
}
globalThis.NOW = Math.floor(Date.now() / 1000 - 16e8)
setInterval(() => {
	NOW = Math.floor(Date.now() / 1000 - 16e8)
}, 50)
import repl from 'basic-repl'
repl('$',_=>eval(_))