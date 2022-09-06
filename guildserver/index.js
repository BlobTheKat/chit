import { WebSocketServer, WebSocket } from 'ws'
import fetch from 'node-fetch'
import {promises as fs} from 'fs'
import "./type.js"
import { parse, stringifyAll } from './schema.js'
import * as messages from './messages.js'
import "./guild.js"
import { Member } from './guild.js'
let hash = -1, mask = 0
for(const l of (await fetch('http://incipio.local/guildservers.txt').then(a=>a.text())).split('\n')){
	if(l.split(' ')[1] == process.argv[2]){
		const [a, b] = l.split(' ',1)[0].split('/')
		mask = 32 - b; hash = parseInt(a, 16) >>> mask
		break
	}
}
if(hash == -1)throw "Could not find server "+process.argv[2]+" in guildservers.txt"
const server = new WebSocketServer({port: +process.argv[2].split(':')[1] || 81})
WebSocket.prototype[Symbol.for('nodejs.util.inspect.custom')] = function(){return '<WebSocket \x1b[33m'+this._socket.address().address+'\x1b[m>'}
const crcTable = Array.from({length:256},(_,n) => {let c = n;for(let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));return c})
function crc32(str){
	let crc = -1, len = str.length, i = 0
	while(i < len)crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i++)) & 0xFF]
	return ~crc
}
const guilds = new Map()
for(const k of await fs.readdir('./guilds')){
	fs.readFile('./guilds/'+k).then(a=>{
		let g
		for(let i of a.toString().split('\n\n'))g = parse(i)
		g.id = k
		guilds.set(k,g)
		globalThis.g = guilds.get('#chitdev')
	})
}
const clear = '\x1b[3J\x1bc'
server.on('connection', async (ws, {url}) => {
	let dat, guild, token
	try{
		[guild, token, dat] = url.slice(1).split('/').map(decodeURIComponent)
		dat = JSON.parse(dat)
	}catch(e){return ws.close()}
	if(typeof dat.id != 'string' || typeof dat.icon != 'string' || typeof dat.signature != 'string')return ws.close()
	ws.id = dat.id
	if(!await messages.verify(ws.id, token))return ws.close()
	if(!(guild = guilds.get(guild)))return ws.send(''),ws.close()
	ws.guild = guild
	ws.member = guild.members.get(ws.id) || new Member({id: ws.id, icon: '', perms: -1})
	ws.member.icon = dat.icon
	ws.member.ws.add(ws)
	guild._.me = ws.member
	ws.mirrors = new Set
	guild.focus.add(ws)
	if(dat.signature)messages.receipt(ws, dat.signature)
	ws.on('close', closed)
	ws.on('message', msg)
})
server.on('listening', () => console.log('Listening on :'+server.address().port))
function closed(){
	if(!++this.member.lastSeen)this.member.lastSeen = NOW
	for(const m of this.mirrors)m.delete(this)
	this.member.ws.delete(this)
}
function msg(d){
	const [code, data] = d.toString().split1('\n')
	if(this.member.perms == -1 && !code.startsWith('focus')){
		this.member.perms = 1
		this.guild.members.push(this.member)
	}else if(this.member.perms < -1 && NOW + this.member.perms > 0)this.member.perms = 0
	if(code == 'verify')return
	if(messages[code])messages[code].call(this, this, data)
}
globalThis.NOW = Math.floor(Date.now() / 1000 - 16e8)
let lastSave = NOW
function save(i){
	let {value} = i.next()
	if(!value)return
	let d = Date.now()
	fs.writeFile('./guilds/'+value.id, stringifyAll(value))
	setTimeout(save, Date.now() - d, i)
	lastSave = NOW
}
setInterval(() => {
	NOW = Math.floor(Date.now() / 1000 - 16e8)
	if(NOW - lastSave > 3600){
		//save all guilds
		lastSave = NOW
		save(guilds.values())
	}
}, 50)

;(await import('basic-repl')).default('$',_=>eval(_))