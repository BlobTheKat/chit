import { WebSocketServer } from 'ws'
import fetch from 'node-fetch'
import {promises as fs, exists} from 'fs'
import * as messages from './messages.js'
import {maketoken, verify} from "./signatures.js"
for(let i = 0; i < 256; i++)exists('./users/'+i, a=>a||fs.mkdir('./users/'+i))
let hash = -1, mask = 0
for(const l of (await fetch('http://localhost/authservers.txt').then(a=>a.text())).split('\n')){
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

server.on('connection', async (ws, {url}) => {
	try{
		const [user, token] = url.slice(1).split('/').map(decodeURIComponent)
		user_regex.lastIndex = 0
		const crc = crc32(user)
		if(crc >>> mask != hash || !user_regex.test(user))return ws.send('"Invalid username!"'),ws.close()
		ws.id = user
		let str = ''
		if(token[0] == '.'){
			try{await fs.readFile(`./users/${crc&0xff}/${user}`);ws.send('"Username taken"');return ws.close()}catch(e){}
			const res = await (await fetch('http://localhost:78/' + encodeURIComponent(token.slice(1)))).text()
			if(res == 'false')return ws.send('"Invalid invite code"'),ws.close()
			ws.data = {
				sockets: new Set,
				bits: 3,
				lastsign: 0,
				signature: '',
				icon: '',
				guilds: []
			}
			ws.data.sockets.saving = 0
			conns.set(user, ws.data)
			ws.send(JSON.stringify(ws.data).slice(0,-1)+',"token":"'+await maketoken(user)+'"}')
		}else{
			if(!await verify(user, token))return ws.close()
			ws.data = conns.get(user)
			if(!ws.data){
				const str = ''+await fs.readFile(`./users/${crc&0xff}/${user}`)
				ws.send(str)
				conns.set(user, ws.data = JSON.parse(str))
				;(ws.data.sockets = new Set).saving = 0
			}
		}
		const set = ws.data.sockets
		if(set.saving == 1)set.saving = 2
		set.add(ws)
		ws.cbs = []
		
		ws.on('message', msg)
		ws.on('close', closed)
	}catch(e){return ws.close()}
})
server.on('listening', () => console.log('Listening on :'+server.address().port))
const clear = '\x1b[3J\x1bc'
async function closed(){
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
globalThis.NOW = Math.floor(Date.now() / 1000 - 16e8)
setInterval(() => {
	NOW = Math.floor(Date.now() / 1000 - 16e8)
}, 50)
import repl from 'basic-repl'
repl('$',_=>eval(_))