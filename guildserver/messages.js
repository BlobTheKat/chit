import { Channel, Message } from "./guild.js"
import s from 'sodium-plus'
import fetch from 'node-fetch'
import {promises as fs} from "fs"
const sodium = await s.SodiumPlus.auto()
const key = await sodium.crypto_box_keypair()
key.buffer.set(await fs.readFile('key'))
const sec = await sodium.crypto_box_secretkey(key)
const pub = await sodium.crypto_box_publickey(key)
const nonce = Buffer.from('YOcKVAiq2Z7GrDVJhbNlNJPn85Z7Zgio', 'base64')
const LVLS = await fetch('http://incipio.local/chstats.json').then(a=>a.json())
export const verify = async (id, token) => {
	const [nonce, buf] = token.split1('.')
	try{return (await sodium.crypto_box_open(Buffer.from(buf, 'base64'), Buffer.from(nonce, 'base64'), sec, pub)) == id}catch(e){return false}
}
//verify signature and return number of bits associated with it
const signature = async (w, sig, min = -1, max = min) => {
	let i = sig.lastIndexOf(':')
	if(i < 0)return 0
	const s = sig.slice(0, i)
	try{
		if(await sodium.crypto_box_open(Buffer.from(sig.slice(i + 1), 'base64'), nonce, sec, pub) != s)return 0
		const [id, gid, n, bits] = s.split(':')
		if(id != w.id || gid != w.guild.id)return 0
		if(+n < w.member.lastsign + .75)return 0
		if(bits < min || bits > max){
			w.send('\n\nreceipterr\n'+(bits>max?'Too many bits!':'Not enough bits!')+'\n'+(await sodium.crypto_box(`${w.id}:${w.guild.id}:${n}:1`, nonce, sec, pub)).toString('base64'))
			return 0
		}
		w.send('\n\nreceipt\n'+(await sodium.crypto_box(`${w.id}:${w.guild.id}:${n}:0`, nonce, sec, pub)).toString('base64'))
		w.member.perk = Math.floor(NOW + 604800 * (Math.log2(2 ** ((w.member.perk - NOW) / 604800 + 2) + +bits + 7) - 2))
		w.member.lastsign = +n
		return +bits
	}catch(e){return 0}
}
const idify = a => {
	if(a[0] >= '0' && a[0] <= '9')return ''
	const b = a.toLowerCase().replace(/\W/g, a => a == '-' ? '_' : a = '')
	return a && b
}

export function focusGuild({guild, member}){
	guild._.me = member
	guild.focus2.add(this)
	if(member.lastSeen >= 0)member.lastSeen = -1
	else member.lastSeen--
}
export function focusNoGuild({guild, member}){
	guild.focus2.delete(this)
	if(!++member.lastSeen)member.lastSeen = NOW
}
export function focusChannel({guild}, data){
	const ch = guild.channels.get(data)
	if(!ch)return
	ch.focus.add(this)
}
export function focusNoChannel({guild}, data){
	const ch = guild.channels.get(data)
	if(!ch)return
	ch.focus.delete(this)
}

export function sendMsg({guild, member}, data){
	if(member.perms < 0)return
	const [cid, content] = data.split1('\n')
	if(content.length > 1000)return
	const ch = guild.channels.get(cid)
	if(!ch)return
	ch.messages.push(new Message({content, author: member}))
	if(ch.messages.length > 50)ch.messages.remove(0)
}

export function icon({member}, data){
	if(data.length > 10000 || (data && !data.startsWith('data:image/')))return
	member.icon = data
}

export function guildname({member, guild}, data){
	if(member.perms < 4 || data.length > 30)return
	guild.name = data
}
export function guildicon({member, guild}, data){
	if(member.perms < 4 || data.length > 10000 || !data.startsWith('data:image/'))return
	guild.icon = data
}
const types = {
	'': 2,
	'place': 7
}
export function create({member, guild}, data){
	if(member.perms < 3)return
	let [id, type] = data.split1('\n')
	if((id = '/' + idify(id)).length < 4 || guild.channels.has(id) || guild.newchannel)return
	if(!types[type])return
	guild.newchannel = true
	guild.channels.push(new Channel({type, id, level: 0, bits: 0}))
}

export async function upgrade({guild}, data){
	const [cid, sig] = data.split1('\n')
	const ch = guild.channels.get(cid)
	if(!ch || ch.level == 9 || !LVLS[ch.type])return signature(this, sig)
	const max = LVLS[ch.type][ch.level] - ch.bits
	const a = await signature(this, sig, 1, max)
	if(a == max){
		if(!ch.level)guild.newchannel = false
		ch.bits = 0
		ch.level++
	}else ch.bits += a
	guild.bits += a
	let p = LVLS.guild[guild.level]
	while(guild.bits >= p && guild.level < 9){
		guild.bits -= p
		guild.level++
		p = LVLS.guild[guild.level]
	}
}

export async function receipt(w, sig){
	let i = sig.lastIndexOf(':')
	if(i < 0)return
	const s = sig.slice(0, i)
	try{
		if(await sodium.crypto_box_open(Buffer.from(sig.slice(i + 1), 'base64'), nonce, sec, pub) != s)return
		const [id, gid, n] = s.split(':')
		if(id != w.id || gid != w.guild.id)return
		if(+n > w.member.lastsign + 0.25){
			w.send('\n\nreceipt2\n'+(await sodium.crypto_box(`${w.id}:${w.guild.id}:${n}:1`, nonce, sec, pub)).toString('base64'))
			w.member.lastsign = +n - .5
		}else{
			w.send('\n\nreceipt2\n'+(await sodium.crypto_box(`${w.id}:${w.guild.id}:${n}:0`, nonce, sec, pub)).toString('base64'))
		}
	}catch(e){}
}