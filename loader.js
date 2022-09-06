import { Channel } from "./state/channel.js"
import { Guild } from "./state/guild.js"
import { addType, parse } from "./schema.js"
import { Message } from "./state/message.js"
import { Member } from "./state/member.js"

if(loaded.l)await new Promise(r=>loaded.cb=r)
me.ws = loaded.ws
loaded.dat.id = me.id = localStorage.id
me.icon = loaded.dat.icon
me.bits = loaded.dat.bits
localStorage.token = loaded.dat.token || localStorage.token
let dat = encodeURIComponent(JSON.stringify(loaded.dat))
me.ws.onmessage = function({data}){
	const i = data.indexOf('\n') + 1 || data.length + 1
	const code = data.slice(0, i - 1)
	data = data.slice(i)
	if(msgs[code])msgs[code](data)
}
const msgs = {
	icon(a){
		me.icon = a
		for(const g of me.guilds)if(g.me.id)g.me.icon = a
	},
	signerr(a){
		if(a[0] == '@'){
			const [, g] = a.split(':', 2)
			me.guilds.get(g).ws.send('receipt\n'+a)
			return
		}
		serr(a)
		scb = serr = null
	},
	sign(a){
		r2cs = ''
		scb(a)
		scb = serr = null
	},
	bits(a){ me.bits = +a },
	join(a){join(a)},
	leave(a){me.guilds.delete(a)}
}
let scb = null, serr = null, r2cs = '', rcb = null, rerr = null
globalThis.sign = (bits, {id}) => scb ? Promise.reject('Transaction in progress! Wait!') : new Promise((r, c) => {
	me.ws.send(r2cs = 'pay\n'+id+'\n'+bits)
	scb = r, serr = c
})
globalThis.upgrade = (g, ch, sig) => rcb ? Promise.reject('Transaction in progress! Wait!') : new Promise((r, c) => {
	g.ws.send('upgrade\n'+ch.id+'\n'+sig)
	rcb = r, rerr = c
})
const gmsgs = {
	receipterr(_, data){
		let err; [err, data] = data.split('\n')
		//failed; display error message
		rerr(err)
		rcb = rerr = null
		me.ws.send('receipt\n'+data)
	},
	receipt(_, data){
		rcb()
		rcb = rerr = null
		me.ws.send('receipt\n'+data)
	},
	receipt2(g, data){
		me.ws.send('receipt\n'+data)
		if(r2cs){
			me.ws.send(r2cs)
			r2cs = ''
		}
	}
}
for(const i of loaded.dat.guilds){
	loaded.l++
	const g = new Guild({id: i})
	load(g)
	me.guilds.push(g)
}
addType(Guild, 'g', {
	name: String,
	icon: String,
	bits: Number,
	level: Number,
	upgrading: Number,
	newchannel: Boolean,
	channels: [Channel],
	me: Member,
})
addType(Channel, 'c', {
	id: String,
	type: String,
	level: Number,
	bits: Number,
	messages: [Message]
})
addType(Message, 'm', {
	id: String,
	content: String,
	author: Member
})
addType(Member, 'M', {
	id: String,
	icon: String,
	perms: Number,
	lastsign: Number,
	perk: Number
})
export function load(guild, cb){
	let crc = crc32(guild.id)
	let node = loaded.root
	while(Array.isArray(node)){
		node = node[crc >>> 28]
		crc <<= 4
	}
	if(guild.ws && me.current == guild)me.current = me.cur
	guild.ws = new WebSocket(`ws://${node}/${encodeURIComponent(guild.id)}/${encodeURIComponent(localStorage.token)}/${dat || encodeURIComponent(JSON.stringify(me))}`)
	let opened = false
	guild.ws.onmessage = function({data}){
		if(!opened){
			if(!data){
				if(me.current == guild || me.current == Guild.none)me.current = me.cur
				me.ws.send('leave\n'+guild.id)
				cb = null
				return
			}
			guild._id = +data.split(' ', 1)[0]
			guild.bucket.set(guild._id, guild)
			parse(data, guild.bucket)
			opened = true
			loaded()
			if(cb)cb()
			return
		}
		const dat = data.split('\n\n')
		if(!dat[0]){ data = dat.join('\n\n').slice(2)
			const i = data.indexOf('\n') + 1 || data.length + 1
			const code = data.slice(0, i - 1)
			data = data.slice(i)
			if(gmsgs[code])gmsgs[code](guild, data)
			return
		}
		for(const d of dat) parse(d, guild.bucket)
		if(guild.current._id>=0)guild.bucket.set(guild.current._id, guild.current)
	}
	guild.ws.onclose = function(){
		if(opened)load(guild, cb)
		else{
			guild.name = ''
			guild.icon = ''
			if(cb)cb()
			loaded()
		}
	}
}
globalThis.join = i => new Promise(r => {
	const g = new Guild({id: i})
	me.ws.send('join\n'+i)
	load(g, () => (me.guilds.push(g),r(g)))
})
if(loaded.l)await new Promise(r=>loaded.cb=r)
await document.fonts.ready
me.loaded = true
dat = ''