import { errSignature, sign } from "./signatures.js"

export function icon(user, data){
	if(data.length > 10000 || (data && !data.startsWith('data:image/')))return this.send('icon\n'+user.icon)
	user.icon = data
	for(const c of user.sockets)if(c!=this)c.send('icon\n'+data)
}

export function pay(_, data){
	const [a, b] = data.split1('\n')
	sign(this, a, b)
}

export function join(user, id){
	if(id[0] != '#')return
	if(user.guilds.length == 200 || user.guilds.indexOf(id) > -1)return
	user.guilds.push(id)
	for(const c of user.sockets)if(c != this)c.send('join\n'+id)
}

export function leave(user, id){
	if(id[0] != '#')return
	const i = user.guilds.indexOf(id)
	if(i == -1)return
	user.guilds.splice(i, 1)
	for(const c of user.sockets)if(c != this)c.send('leave\n'+id)
}
export const receipt = errSignature