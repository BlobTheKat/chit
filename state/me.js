import { Channel } from "./channel.js"
import { Guild } from "./guild.js"
import { sethash } from "./hash.js"
import { Member } from "./member.js"
import { Message } from "./message.js"

export const Donation = Type(class{
	channel = Channel.none
	guild = Guild.none
	bits = 0
	err = ""
	animating = false
	sign(){
		if(me.bits < this.bits)return this.err = "You don't have enough bits!"
		const ch = this.channel, g = this.guild
		sign(this.bits, g).then(sig => upgrade(g, ch, sig)).then(() => {
			this.animating = true
		}).catch(e => {
			this.err = e
		})
	}
})

export const Me = Type(class{
	id = ''
	bits = 0
	icon = ''
	dark = true
	guilds = []
	current = Guild.none
	theme = ''
	loaded = false
	ws = null
	donation = Donation.none
	donatefor(ch = Channel.none){
		if(this.donation == Donation.none)this.donation = new Donation()
		this.donation.bits = ch == Channel.none ? 0 : 1
		this.donation.channel = ch
		this.donation.guild = ch.guild
		this.donation.err = ''
	}
	cur = Guild.none
	set_icon(a){this.cur.icon=a}
	set_id(a){this.cur.id=a}
	set_current(g, o){
		o.isCurrent = false
		g.isCurrent = true
		sethash()
	}
	set_theme(a){localStorage.theme = a}
	set_dark(a){localStorage.dark = +a}
	set_loaded(a, o){
		if(a)onhashchange(false)
		else if(o)location.reload()
	}
})

Object.defineProperties(globalThis, {
	channel: {
		set(a){me.current.current=me.current.channels.get(a)||Channel.none},
		get(){return me.current.current}
	},
	guild: {
		set(a){me.current=me.guilds.get(a)||Guild.none},
		get(){return me.current}
	}
})
let j=0
globalThis.newguild=function(){me.guilds.push(new Guild({
	me: new Member({perms:4,icon:me.icon,id:me.id}),
	channels: [new Channel({id:'/general', messages: [new Message({
		content: 'This guild is \'client-only\': Your friends cannot join this guild and it does not exist anywhere except on your device. It will be deleted once you close chit.gg',
		author: new Member({id: 'system', icon: './img/loadingwhite.gif'})
	})]})],
	icon: './img/icon'+Math.floor(Math.random()*8)+'.png',
	id: '#test:'+(j++)
}));return '#test:'+(j-1)}
const cmds = {
	'send%c`Hello!`':'Send a message',
	'channel = %c"/general"': 'Travel channel',
	'guild = %c"#supercoolplace"': '  Travel guild',
	'newguild()%c': 'Create client-only guild'
}
globalThis.menu = function(){
	console.clear()
	if(channel.id[0] != '/')return
	const a = []
	console.log(`%cWelcome to the chit.gg CLI!\n%cavailable commands:\n`+Object.entries(cmds).map(([k,v])=>(a.push('color:#888','','color:#e52'),'%c'+v+': %c'+k+'')).join('\n'),'color:#25e;font-size:20px','',...a)
	console.log('%c'+guild.id+'%c'+channel.id+'\n%chttps://chit.gg'+guild.id+channel.id,'font-size:30px;','font-size:20px;color:#888','color:#22E')
}