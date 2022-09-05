import { Channel } from "./channel.js"

let curhash = '\0'
document.title = 'chit.gg'
export function sethash(){
	if(curhash == '\0')return
	if(me.current.id[0] != '#'){
		document.title = 'chit.gg'
		return
	}
	const hash = me.current.id + me.current.current.id
	location.hash = curhash = hash
	document.title = 'chit.gg '+hash
	menu()
}
onhashchange = (a = true) => {
	if((location.hash == curhash || !me.loaded) && a)return
	const hash = location.hash
	curhash = '\0'
	const [gid, cid] = hash.split(/(?=\/)/)
	if(!gid)return void(curhash = location.hash, me.current = me.cur)
	const guild = me.guilds.get(gid)
	if(!guild){
		//join guild
		join(gid).then(a => me.current = a)
		curhash = hash
		return
	}
	if(guild != me.current)me.current = guild
	const channel = cid ? me.current.channels.get(cid) : undefined
	if(channel && me.current.current != channel && channel.level){
		me.current.current = channel
	}
	document.title = 'chit.gg '+hash
	curhash = hash
	menu()
}