import "./lib.js"
import { Me } from './state/me.js'
import { App } from "./app/app.js"
import { Guild } from "./state/guild.js"
import { Channel } from "./state/channel.js"
declared()
if(localStorage.theme === undefined)localStorage.theme = './img/creo'+Math.floor(Math.random()*8)+'.png'
globalThis.me = new Me({theme: localStorage.theme, dark: !(1-localStorage.dark || 0)})
me.cur = new Guild({id:'',name:'Settings', channels: ['Profile', 'Appearance'].map(a=>
	new Channel({id: a, type: 'settings-'+a.toLowerCase(), level: 1})
), level: 0})
me.cur.current = me.cur.channels.at(0)
me.guilds.push(me.cur)
document.render(me.mirror(App))
await import("./loader.js")

globalThis.NOW = Math.floor(Date.now() / 1000 - 16e8)
setInterval(() => {
	NOW = Math.floor(Date.now() / 1000 - 16e8)
}, 50)