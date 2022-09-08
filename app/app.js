import { LVLS } from "../state/guild.js"
import { askfile, fileToFixedImg } from "./img.js"

function formatTime(a){
	if(a < 3600e3){
		if(a >= 60e3)return Math.floor(a/60e3)+'m '+Math.floor(a%60e3/1000)+'s'
		else if(a >= 1000)return Math.floor(a/1000)+'s'
		else return a ? a+'ms' : '0s'
	}else{
		if(a < 86400e3)return Math.floor(a/3600e3)+'h '+Math.floor(a%3600e3/60e3)+'m'
		else if(a < 864000e3)return Math.floor(a/86400e3)+'d '+Math.floor(a%86400e3/3600e3)+'h'
		else return Math.floor(a/86400e3)+'d'
	}
}
const bitsurl = a => '../img/bits'+(a < 4 ? 1 : a < 15 ? 2 : a < 50 ? 3 : a < 160 ? 4 : 5)+'.webp'
font('ubuntu', './img/Ubuntu-Bold.ttf')
font('ubuntu-thin', './img/Ubuntu-Regular.ttf')
const istyle = document.createElement('style')
istyle.innerHTML = `
body,html{height:100%}
@font-face{font-family:ubuntu;src:url('../img/Ubuntu-Bold.ttf')}
@font-face{font-family:ubuntu-thin;src:url('../img/Ubuntu-Regular.ttf')}
body{font-family:ubuntu;color:var(--col);user-select:none;-webkit-user-select:none}
${document.styleSheets[0].cssRules[0].cssText}`
const COLS = ['#E25', '#5E2', '#25E', '#52E']
const COLORS = ['#888', '', '#52E', '#5E2', '#E52', '#E52', '#FC0']
const TINTED_DARK = Object.fromEntries(['#fec', '#fce', '#efc', '#cef', '#ecf', '#cee', '#eec', '#ccc'].map((a,i)=>['--tint'+i,a]))
const TINTED_LIGHT = Object.fromEntries(['#630', '#603', '#360', '#036', '#306', '#033', '#330', '#333'].map((a,i)=>['--tint'+i,a]))
const DEFAULT_ICONS = [0,1,2,3,4,5,6,7].map(a=>`./img/def${a}.png`)
const filter = 'brightness(--bri) contrast(1.5)'
export const App = Box({font: 'ubuntu', bg: '--bg', col: '--col'},
	Text({font: 'ubuntu-thin',size:0},'copyright blobkat 2022'), //preload fonts
	Text({size:0},'blob.kat@hotmail.com'), //preload fonts
	Flex('right center items:center', fixed, {t:0,l:0,b:0,r:0,z:5,bg:'#0006'},
		Flex('down', fixed, {shadow:'0 0 50px --col2',w: 'min(100%, 400px)', h: 'min(100%, 500px)', bg: '--bgl', radius: 10, padding: 50, opacity: 1, transition: 'opacity 0s .6s'},
			Icon('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAA/CAYAAABXXxDfAAAAAXNSR0IArs4c6QAAAiRJREFUaEPtm1uOgzAMRYddswR23RGVqGhK4te9ToLoX0swPseQmAqWv+Kzbdtr/2ld16XcNuv3GtMX4DHogLyDgBbTB74cdAcBEtMbvjZoZgEapkUaNKMALZMafpZJUAu+86hO+/MsP/IkaAHfOcQJ72p5G1GAFfxT+QPQE2CEtd+b908j4w3US0Ik38suLhIwU0I0z2oLGw3MloDIr9m/Iw7AkIDKS7x5QR0IJQGZjwivaX+z+gAk+M9S16oO+sDWM4FxfFXle/cBDHBT5XsJYIG74DPnACa4Gz5DABs8BM8UkAEehmcIyAKHwCMFZILD4BECssGh8BEBPcDh8B4BvcAp8FYB2jaX8deZqb3VJooWwACnVd7TCtfEssDp8NEzgAmeAu8VwAZPg7cKyABPg7csZ8e1nyGANtsjJj22ACq8p+LlrM8UQINHgLMvAQo8EpwpAA5vAd9Paet4S5cpjYXCe0G8+0lw0nYYfBQgur8EerUdAo9KHBVHKyIMj04YHa8lIgTPSpQVtxThhmcnyI7v7u0zEsu4GTJXPgvcc29gbYVN8NngbAFq+F7gTAEq+N7gLAEi/CjgDAHP01hXXdBoFS9zROT3PIF5toowqr2xQIyL5Nt8waiVnLWhQIDWYngFPM/be80xq+mJbeXo+h+aB1DaxyJADT/SNY4SoHrBaCZwbSeoesFoRnBJwMHUXOpmBq8JODNVXzC6A3gpoGT6B18pxqs4/whfAAAAAElFTkSuQmCC', {t: 15, r: 15,w: 21, h: 21, cursor: 'pointer'}).on('click', d => d.bits = 0),
			Text({size:32,textAlign: 'center', lineHeight: '44px'},'Donate bits!'),
			Spacer(20),
			'For channel:',
			Spacer(10),
			Flex('right',{padding:5,radius:5, bg: '--col2', gap: 5},
				Icon('',{filter, imageRendering:'pixelated',w:24,h:24}).changed('type', ({type}, el) => el.src = `./img/channel-${type}.png`),
				Text().changed('id', ({id}, txt) => txt.text = id.replace('/','')),
				Text({size:12, flex: 1, bg: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAORJREFUaEPtl0EOgzAQA+HXeUJ+3aqHSAipze7aJqKYM4EZ20Ji325+7Tfn3yywukE34AbABKQT6r2/PnytNdl7ZA8e8CNglYRE4AyvlKALfINXSVjg+BGZpa9ogdZAFJ4tQRHIwjMlYIEqPEsCEkDhGRLPFWClj7ZQaoANj0ikBVTwVYmUgBq+IhEWuAo+K/EMgavTz7QwbWAVfFTip8Bq+IjEtIHoP3dWlvWLaYHRkBuIbvV0nyfkCRWnM455Qp6QJwQm4AmBAfor9DcTApdQPk6bUJkAPGgBMED4uBuAIwQf8AZooIwxh/MZIQAAAABJRU5ErkJggg==) 5px 2px/12px no-repeat', verticalAlign: 'top', paddingLeft: 15, col: '#888', filter}).changed('level', ({level}, el) => el.text = level).if('level', a => a < 2, {opacity:0})
			).for('channel'),
			Spacer(30),
			'For guild:',
			Spacer(10),
			Flex('right',{padding:5,radius:5, bg: '--col2', gap: 5},
				Icon('',{w:24,h:24}).changed('icon', ({icon}, el) => el.src = icon),
				Text().changed('id', ({id}, txt) => txt.text = id),
			).for('guild'),
			Spacer(30),
			Flex('right items:center', {gap:20},
				Icon(bitsurl(20), {w:50,h:50}).changed('bits', ({bits}, el) => el.src = bitsurl(bits)), 
				Input('number', '...', 5, {w: 50, borderBottom: '2px white solid'}).changed('bits', ({bits}, el) => el.focused || (el.value = bits))
					.on('input', (d, el) => {
						let v = Math.floor(+el.value)
						const MAX = Math.min(me.bits, (LVLS[d.channel.type] ? LVLS[d.channel.type][d.channel.level] : 10000) - d.channel.bits)
						if(!v)return
						if(v > MAX)v = el.value = MAX
						if(v < 1)v = el.value = 1
						d.bits = v
					}).on('change', (d, el) => el.value = d.bits = Math.max(1, Math.min(Math.max(me.bits, 10000), Math.floor(+el.value)))),
				' bits'
			),
			Text({h: 40, lineHeight: '40px', size: 18, col: 'red'}).changed('err', ({err}, el) => el.text = err),
			Box('Donate!', {size: 22, cursor: 'pointer', bg: '#25E', radius: 10, textAlign: 'center', padding: 10, lineHeight: '30px'})
				.on('click', () => me.donation.sign())
		).if('animating', true, {opacity: 0, transition: 'opacity 0s', prio: 3}),
		Text({size: 70, transition: 'transform .5s, opacity .5s',opacity:1,transform:'scale(1)'},
			Icon({verticalAlign: 'middle'}, bitsurl(20), {w:100,h:100}).changed('bits', ({bits}, el) => el.src = bitsurl(bits)),
			''
		).changed('bits', ({bits}, el) => el.focused || (el.lastChild.textContent = '+'+bits)).if('animating', false, {transform:'scale(0)',opacity:0}),
		Box(fixed,{t:0,l:0,b:0,r:0},
			...Array(20).fill({w:20,h:20,transition:'transform 1s', imageRendering: 'pixelated', display: 'none'}).map(s => Icon('', fixed, s))
		).changed('animating', (a, el) => {if(a.animating){
			el.previousSibling.firstChild.src = el.previousSibling.firstChild.src
			el.style.display = 'block'
			const els = el.children
			let i = 0
			let int = setInterval(() => {
				const el = els[i % 20]
				if(i >= 40){
					el.style.display = '',i++
					if(i == 59)clearInterval(int), a.animating = false, setTimeout(()=>a.bits=0,500)
					return
				}else if(i < 20)el.style.display = 'block', el.src = './img/pop'+(i%3+1)+'.gif'
				const t = Math.floor((Math.random() - 0.5) * innerHeight), l = Math.floor((Math.random() - 0.5) * innerWidth)
				el.style.top = t*0.7 + innerHeight / 2 - 5 + 'px'
				el.style.left = l*0.7 + innerWidth / 2 - 5 + 'px'
				el.style.transition = 'none'
				el.style.transform = ''
				el.offsetHeight
				el.style.transition = ''
				el.style.transform = `translate(${l*0.3}px, ${t*0.3}px)`				
				const col = Math.random()
				el.style.filter = `saturate(${col > 0.6 ? 1 : col > 0.2 ? 0.5 : 0}) hue-rotate(${col * 1080 % 360}deg)`
				i++
			}, 57)
		}else el.style.display = 'none'}),
	).for('donation').if('bits', 0, hidden),
	Box('', {imageRendering: 'pixelated', w: 4000, h: 4000, padding: 1970, opacity: 1, transition: '.5s opacity', backdropFilter: 'blur(20px)', z: 99, t: 'calc(50% - 2000px)', l: 'calc(50% - 2000px)'})
		.changed('dark', ({dark}, i) => i.set('bg', `url(./img/loading${dark ? 'white' : 'black'}.gif) center/60px no-repeat`))
		.changed('loaded', ({loaded}, i) => {if(!loaded)return;i.set('opacity',0);setTimeout(i.remove.bind(i),500)}),
	Flex('right', {padding:10,b:0,h:60,l:0,r:0,gap:10,backdropFilter: 'blur(16px) contrast(1.4)'},
		Icon('',{w:40,h:40, cursor: 'pointer', transition: '.2s box-shadow', shadow: '0 0 --col', radius: 15, active: {transform:'translateY(2px)'}, hover: {shadow: '0 0 1px 1px --col'}}).for('guilds')
			.changed('icon', ({icon, id}, ic) => ic.src = icon || (id[0]=='#' ? 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZCAYAAADE6YVjAAAAAXNSR0IArs4c6QAAAH5JREFUSEvtlEsKgDAMRKen8TL2tHqZnsYiImhJYIZK3KTrNK99+RQEnBLAQEIky56uTcryDq7jXQnSgPVOsAC785CEXGIidNUGHI+a0DOmFP43iNXqdHeZ3Wno+h5ikKcgOfGnUbrwpq6IYWQXM/0TNiEVR68GKpsTlBDJXgdOaiYaMPCaeAAAAABJRU5ErkJggg==' : './img/def'+(id.hashCode()&7)+'.png'))
			.if('isCurrent', true, {shadow: '0 0 0 3px --col !important'})
			.on('click', t => {if(!t.icon&&t.id[0]=='#')return;me.current = t}),
	),
	Flex('right', {t:0,l:0,r:0,b:60},
		Flex('down', {flex:'250px',backdropFilter:'blur(8px) contrast(1.2)',padding: 15, gap:4},
			Flex('right items:center',
				Icon('',{w:40,h:40,shadow:'-2px 2px 0 --col'})
					.changed('icon', ({icon, id}, ic) => ic.src = icon || './img/def'+(id.hashCode()&7)+'.png')
					.on('mouseover', ({me}, el) => el.set('cursor', me.perms >= 4 ? 'pointer' : ''))
					.on('click', g => g.me.perms >= 4 && askfile('image/*').then(fileToFixedImg).then(i => {
						if(i.length > 10e3)return
						g.ws.send('guildicon\n'+i)
					})),
				Flex('down center',{marginLeft: 10, lineHeight: 1.2},
					Input(30).changed('id', ({id}, i) => i.placeholder = id).if('name', a=>a!='\0', hidden)
						.on('blur', g => g.name = g.name)
						.on('keypress', (g, el, e) => {
							if(e.key != 'Enter')return
							g.ws.send('guildname\n'+el.value)
							g.name = g.name
						}),
					Text().changed('id name', ({id, name}, txt) => txt.text = name || id).if('name', a=>a=='\0', hidden).on('mouseover', ({me}, el) => el.set('cursor', me.perms >= 4 ? 'text' : '')).on('click', (g, el) => {
						if(g.me.perms < 4)return
						const n = g.name; g.name = '\0'; g._.name = n
						const t = el.parentElement.firstChild
						t.value = n
						t.focus()
						t.selectionStart = 0; t.selectionEnd = 30
					}),
					Text({opacity:0.7,size:14}).changed('id', ({id}, txt) => txt.text = id).if('name', a=>!a, hidden)
				)
			),
			Spacer(12),
			Text({size:15,marginLeft:20,opacity:0.7}).changed('membercount', ({membercount}, el) => (el.style.display = membercount ? 'block' : 'none', el.text = membercount == 1 ? '1 member' : membercount + ' members')),
			Box({h:30},
				Text({t:0,l:20,size:14}, 'Level 1').changed('level', ({level}, e) => e.text = level ? level == 9 ? 'MAX LEVEL' : 'Level '+level : 'Chit v0.3'),
				Text({t:0,r:20,size:14}, '').changed('level bits', ({level, bits}, e) => e.text = level ? level == 9 ? '' : (LVLS.guild[level] - bits) + ' to level '+(level+1) : ''),
				Box({t:22,l:20,b:0,r:20,bg:'#888',radius:10,filter},
					Box({t:0,l:0,b:0,w:0,radius:10}).changed('id', ({id}, e) => e.set('bg', COLS[id.hashCode()&3])).changed('bits level', ({bits, level}, e) => e.set('w', 'max(8px,'+bits/LVLS.guild[level]*100+'%)'))
				).if('level', 9, {...hidden}).if('bits', 0, hidden)
			),

			Box(
				Flex('right',{'--a': 1, cursor:'pointer',padding:5,radius:5, hover: {bg: '--col1', '--a': 1}, active: {transform:'translateY(2px)'}, gap: 5},
					Icon('',{filter, imageRendering:'pixelated',w:24,h:24}).changed('type', ({type}, el) => el.src = `./img/channel-${type}.png`),
					Text().changed('id', ({id}, txt) => txt.text = id.replace('/','')),
					Text({size:12, flex: 1, bg: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAORJREFUaEPtl0EOgzAQA+HXeUJ+3aqHSAipze7aJqKYM4EZ20Ji325+7Tfn3yywukE34AbABKQT6r2/PnytNdl7ZA8e8CNglYRE4AyvlKALfINXSVjg+BGZpa9ogdZAFJ4tQRHIwjMlYIEqPEsCEkDhGRLPFWClj7ZQaoANj0ikBVTwVYmUgBq+IhEWuAo+K/EMgavTz7QwbWAVfFTip8Bq+IjEtIHoP3dWlvWLaYHRkBuIbvV0nyfkCRWnM455Qp6QJwQm4AmBAfor9DcTApdQPk6bUJkAPGgBMED4uBuAIwQf8AZooIwxh/MZIQAAAABJRU5ErkJggg==) 5px 2px/12px no-repeat', verticalAlign: 'top', paddingLeft: 15, col: '#888', filter}).changed('level', ({level}, el) => (el.parentElement.set('opacity',level?'1':'0.5'),el.text = level)).if('level', a => a < 2, {opacity:0}),
					Box({bg: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAORJREFUaEPtl0EOgzAQA+HXeUJ+3aqHSAipze7aJqKYM4EZ20Ji325+7Tfn3yywukE34AbABKQT6r2/PnytNdl7ZA8e8CNglYRE4AyvlKALfINXSVjg+BGZpa9ogdZAFJ4tQRHIwjMlYIEqPEsCEkDhGRLPFWClj7ZQaoANj0ikBVTwVYmUgBq+IhEWuAo+K/EMgavTz7QwbWAVfFTip8Bq+IjEtIHoP3dWlvWLaYHRkBuIbvV0nyfkCRWnM455Qp6QJwQm4AmBAfor9DcTApdQPk6bUJkAPGgBMED4uBuAIwQf8AZooIwxh/MZIQAAAABJRU5ErkJggg==) 0 0/24px no-repeat', width: 'calc(--a * 24)', opacity: 0.7, hover: {opacity: 1}, active: {opacity: 0.7}, filter})
						.on('click', ch => {
							me.donatefor(ch)
							return true
						}).if('upgradable', false, hidden)
				).if('bits', 0, {'--a':0}).changed('isCurrent', ({isCurrent}, node) => node.set('bg', isCurrent ? '--col2' : '').set('--a', isCurrent ? 1 : '')),
				Box({h:30},
					Text({t:0,l:20,size:14}, '0 bits').changed('bits', ({bits}, e) => e.text = bits + ' bits'),
					Text({t:0,r:20,size:14}, '/ 100').changed('level', ({level, type}, e) => e.text = '/ '+(LVLS[type] ? LVLS[type][level] : '')),
					Box({t:22,l:20,b:0,r:20,bg:'#888',radius:10,filter},
						Box({t:0,l:0,b:0,w:0,radius:10}).changed('guild', ({guild}, e) => e.set('bg', COLS[guild.id.hashCode()&3])).changed('bits level type', ({bits, type, level}, e) => e.set('w', 'max(8px,'+bits/(LVLS[type] ? LVLS[type][level] : 10000)*100+'%)'))
					)
				).if('bits', 0, hidden).if('level', 0, {display: 'block', prio: 21})
			).for('channels')
				.on('click', (t, el) => {if(t != me.current.current)me.current.current = t}),
			Flex('right center', {textAlign: 'center', cursor: 'pointer', padding: [5,15], radius: 5, hover: {bg: '--col1'}, active: {transform:'translateY(2px)'}},
				Text('+',{paddingRight:5}),
				Input(30, {flex:1}, '/general', hidden)
					.on('blur', (_, i) => {
						i.add(hidden)
						i.parentElement.set('justifyContent', '')
						i.previousSibling.text = '+'
						i.value = ''
					}).on('keypress', (_, i, e) => {
						if(e.key != 'Enter')return
						if(me.current.channels.has('/'+i.value) || i.value.length < 3)return i.set('col', 'red'), setTimeout(()=>i.set('col',''),1500)
						i.add(hidden)
						i.parentElement.set('justifyContent', '')
						i.previousSibling.text = '+'
						const v = i.value
						i.value = ''
						me.current.ws.send(`create\n${v}\n`)
					})
			).changed('perms newchannel', ({perms, newchannel}, a) => perms >= 3 && !newchannel ? a.remove(hidden) : a.add(hidden))
				.on('click', (_, el) => {
					el.firstChild.text = '/'
					el.set('justifyContent', 'flex-start')
					el.lastChild.remove(hidden)
					el.lastChild.focus()
				})
		),
		Iframe({flex: 1}).if('type', '', hidden).changed('type', (a, el) => (el.style.opacity = 0, el.src = a.type ? './iframes/'+a.type+'.html' : '')).on('load', (ch, el) => {
			let w = el.contentWindow
			if(!w)return
			el.style.opacity = 1
			w.document.body.style.setProperty('--col', me.dark ? '#fff' : '#000')
			w.document.body.style.setProperty('--bg', me.dark ? '#000' : '#fff')
			istyle.remove()
			w.document.head.insertAdjacentElement('afterbegin', istyle)
			w.send = (m, d) => ch.guild.ws.send(`g\n${ch.id} ${m}\n${d}`)
			w.me = me
			w.channel = me.current.current
			w.ontouchend = e => {if(e.cancelable){e.preventDefault();e.target.dispatchEvent(new w.MouseEvent('click', {clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY, bubbles: true}));e.target.focus()}}
			w.document.ondragstart = e => e.preventDefault()
			w.document.addEventListener('mousewheel', e => e.ctrlKey && e.preventDefault(), {passive: false})
			w.loaded && w.loaded()
			w.themechange && w.themechange()
		}).for('current'),
		Flex('down', {flex: 1, padding: 6, scrollable},
			Spacer(0, 1),
			Box({marginBottom: 6,paddingLeft: 42},
				Icon('', {t:0,l:4,w:32,h:32,radius:10}).for('author').changed('icon id', ({icon, id}, ic) => ic.src = icon || DEFAULT_ICONS[id.hashCode()&7]),
				Box(
					Text().changed('id perms', ({perms, id}, txt) => {txt.text = id;txt.set('col', perms < 0 ? '--col2' : COLORS[perms] || '--tint'+(id.hashCode() & 7))}),
					Icon('',{w:'1em',verticalAlign:'middle',marginLeft:10}).changed('perk', ({perk}, el) => {
						const d = perk - NOW
						if(d <= 0)return el.style.display = 'none'
						el.style.display = ''
						if(d <= 799502)el.src = './img/bits1.webp'
						else if(d <= 1359546)el.src = './img/bits2.webp'
						else if(d <= 2149815)el.src = './img/bits3.webp'
						else if(d <= 3114567)el.src = './img/bits4.webp'
						else el.src = './img/bits5.webp'
					})
				).for('author'),
				Paragraph({font: 'ubuntu-thin'},selectable).changed('content', ({content}, el) => el.text = content)
			).for('messages'),
			Paragraph({col:'#E22',overflow:'hidden', marginTop: 6, opacity: 0.8}).changed('notif',({notif},el)=>{
				if(!notif)return
				el.text = notif
				el.set('transition','')
				el.offsetHeight
				el.set('h','1.5em')
				el.offsetHeight
				el.set('transition','height 5s cubic-bezier(1,0,.8,0)')
				el.set('h',0)
			}),
			Textarea('', 1000,{padding:6, shadow: 'none', focus: {shadow: '0 0 10px --col2'}}).on('input', (_,el) => {el.set('h','');el.set('h',el.scrollHeight)})
			.on('keypress', function(ch,el,e){
				if(e.key == 'Enter' && !e.shiftKey){
					e.preventDefault()
					if(!el.value)return
					const ban = ch.guild.me.perms + NOW
					if(ban < 1){
						ch.notif = 'You are banned from speaking in chat for '+formatTime(ban*-1000)
						return
					}
					ch.guild.ws && ch.guild.ws.send(`sendMsg\n${ch.id}\n${el.value}`)
					el.value = ''
					el.set('h','')
				}
			}).changed('id', (ch, el) => (el.placeholder = ch.id[0] == '/' ? 'Message '+ch.id : '', el.disabled = ch.id[0] != '/')),
		).for('current').changed('messages', (ch, el) => {
			if(ch.atBottom)el.scrollTo(0,el.scrollHeight)
		}).on('scroll', (ch, el) => {
			ch.atBottom = el.scrollTop + el.offsetHeight >= el.scrollHeight - 5
		}).if('type', a => a != '', hidden)
	).for('current')
).changed('theme dark current', ({theme, dark, current}, app) => {
  app
		.set('bg', current.theme || theme ? `linear-gradient(${dark ? '#0006, #0006' : '#fff4, #fff4'}), url(${current.theme || theme}) center/cover` : dark ? '#191919' : '#ccc')
		.set('--bg', dark ? '#000' : '#fff')
		.set('--bgl', dark ? '#191919' : '#ccc')
		.set('--col2', dark ? '#fff2' : '#0002')
		.set('--col1', dark ? '#fff1' : '#0001')
		.set(dark ? TINTED_DARK : TINTED_LIGHT)
		.set('--col', dark ? '#fff' : '#000')
		.set('--bri', dark ? '1.15' : theme ? '0.6' : '0.9')
	let i = 0, f
	while(f = window[i++]){
		f.document.body.style.setProperty('--col', dark ? '#fff' : '#000')
		f.document.body.style.setProperty('--bg', dark ? '#000' : '#fff')
		f.themechange && f.themechange()
	}
})