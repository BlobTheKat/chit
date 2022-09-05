import { Channel } from "./channel.js";
import { sethash } from "./hash.js";
import { Member } from "./member.js";
export const LVLS = await fetch('./chstats.json').then(a=>a.json())
export const Guild = Type(class{
	icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAAtJREFUGFdjYAACAAAFAAGq1chRAAAAAElFTkSuQmCC'
	id = ''
	name = ''
	isCurrent = false
	channels = []
	current = Channel.none
	theme = ''
	ws = null
	me = Member.none
	perms = 0
	bits = 0
	level = 1
	upgrading = 3
	newchannel = false
	bucket = new Map
	set_me(a, o){
		if(o)o.mg = null
		a.mg = this
		this.perms = a.perms
		setTimeout(onhashchange, 0, false)
	}
	set_channels(a){
		a.guild = this
		a.upgradable = this.upgrading < 3 && a.level < 9
	}
	set_upgrading(v){
		for(let a of this.channels)a.upgradable = v < 3 && a.level < 9
	}
	set_current(g, o){
		if(!g.level)return o
		if(o)o.isCurrent = false
		g.isCurrent = true
		if(g.id[0] != '/')return
		sethash()
	}
	set_isCurrent(a){
		if(!this.ws)return
		if(a){
			this.ws.send('focusGuild')
			this.current.isCurrent = true
		}else{
			this.ws.send('focusNoGuild')
			this.channels.empty()
			this.current.messages.empty()
			this.current.isCurrent = false
		}
	}
})