import { Guild } from "./guild.js"
import { Message } from "./message.js"
export const Channel = Type(class{
	id = ''
	isCurrent = false
	messages = []
	atBottom = true
	guild = Guild.none
	type = '' //empty = just chat
	level = 1
	bits = 0
	upgradable = false
	set_level(a){
		this.upgradable = a < 9
	}
	notif = ''
	set_messages(a){
		logmsg(a)
		a.channel = this
	}
	set_isCurrent(a){
		if(!this.id || !this.guild || !this.guild.ws)return
		if(a){
			this.guild.ws.send('focusChannel\n'+this.id)
		}else{
			this.guild.ws.send('focusNoChannel\n'+this.id)
			this.messages.empty()
		}
	}
})
const DEF = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADwAAAA8CAYAAAA6/NlyAAAAAXNSR0IArs4c6QAAAQJJREFUaEPtmkEShCAMBOXRvIJH68WLWhhCDZLC3qvAJtOZqZXalHPetx99Eg0vThvCiwPeIAzhxRRgpBcD+mgHwhC+KVBKSZFE8f40do80DU/GDWEDACNtTSgethQa/BwP4+GrAoSWZTlCy1Jo8PNwoVUrqDYpqvU1nYd7WNWAVyAaPhWAsJUx3pRmpE9FvZ70rsfDeNgyrzGKte14GA9fZ0M1EYTWV6HVGA3dy8K9PHR30riRhrni4YrH98c078tDoxW7l+FhPIyH8fCrCwit7nzVbBye0poy553ivrWcV6rmm2lYo2PcUyAcl42mMghrdIx7CoTjstFUBmGNjnFPOQAgK35U0WcfBQAAAABJRU5ErkJggg=='
const cols = ['#888', 'normal', '#52E', '#5E2', '#E52', '#E52', '#FC0']
function logmsg({content, author}){
	console.log('%c'+(chrome||edge?'     ':'')+author.id+(chrome||edge?'\n%c':'\n%c')+content, `color:${cols[author.perms]||(darkmode?'black':'#ccc')};font-family:Consolas,monospace;background:url(${author.icon||DEF}) top left/32px no-repeat;padding:${safari?2:ff?2.5:2.25}px 0px 0 ${chrome||edge?0:33}px;box-sizing:border-box;line-height:14px`,`background-image:url(${author.icon||DEF});background-size:32px;background-repeat:no-repeat;background-position-y:-16px;font-family:Consolas,monospace;padding:${ff?0.5:(safari?1:0)}px 20px 2px 33px;box-sizing:border-box;line-height:14px;margin-left:0`)
}
globalThis.send=function(a, ...b){
	if(typeof a == 'string')a = [a],a.raw=a
	const str = String.raw(a, ...b)
	me.current.ws.send(`sendMsg\n${me.current.current.id}\n${str}`)
}