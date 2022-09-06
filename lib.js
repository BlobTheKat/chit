const props2 = {enumerable:false,value: null}, props = { get: null, set: null }
let fac = b=>class{
	constructor(a = {}, _id = -1){
		for(const k in b){
			if(!(k in a))a[k] = b[k] && b[k]._clone && b[k] != b[k].constructor.none ? b[k]._clone() : b[k]
			if(Array.isArray(a[k]))a[k] = new Arr(a[k])
			if(a[k] instanceof Arr)a[k].top = this, a[k].key = k
		}
		this._ = a
		this._id = _id
		this.mirrors = new Set
	}
	mirror(dest){
		if(dest.target) dest = dest.clone()
		if(!dest.ckeys)dest.ckeys = {}
		dest.target = this
		this.mirrors.add(dest)
		try{dest.events && dest.events.bind && dest.events.bind.call(dest, this, dest.obj || dest)}catch(e){console.error(e)}
		for(let k in dest.ckeys){
			const arr = dest.ckeys[k]
			for(let i = 0; i < arr.length; i += 2){
				const el = arr[i], idx = arr[i+1]
				if((!this[k] || !this[k].mirror) && idx == -1)throw new ReferenceError("Cannot mirror deep property '"+k+"'")
				if(idx == -1)this[k].mirror(el)
				else try{el.callbacks[idx].call(el, this, el.obj || el)}catch(e){console.error(e)}
			}
		}
		dest.events && dest.events.bound && dest.events.bound.call(dest, this, dest.obj || dest)
		return dest
	}
	_set(k){
		for(let c of this.mirrors){
			const arr = c.ckeys[k]
			if(!arr)continue
			for(let i = 0; i < arr.length; i += 2){
				const el = arr[i], idx = arr[i+1]
				if((!this[k] || !this[k].mirror) && idx == -1)throw new ReferenceError("Cannot mirror deep property '"+k+"'")
				if(idx == -1)el.target.unmirror(el),this[k].mirror(el)
				else try{el.callbacks[idx].call(el, this, el.obj || el)}catch(e){console.error(e)}
			}
		}
	}
	unmirror(dest){
		//dont reset props, just unlink
		for(let k in dest.ckeys){
			const arr = dest.ckeys[k]
			for(let i = 0; i < arr.length; i += 2)if(arr[i+1] == -1)this[k].unmirror(arr[i])
		}
		this.mirrors.delete(dest)
		dest.target = null
	}
	_clone(){
		const o = {}
		for(const k in this._){
			const v = this._[k]
			if(v && v._clone)o[k] = v._clone()
			else o[k] = v
		}
		return new this.constructor(o)
	}
}
let getarr = (a) => [...a]
const classes = new Map
globalThis.Type = function(a){
	const t = {}
	const c = fac(t)
	c.none = Object.create(c.prototype)
	c.none._ = t
	c.none.mirrors = new Set
	c.none._id = -1
	classes.set(c, a)
	return c
}
function def(c, a, k){
	if(k == 'constructor')return
	const v = Array.isArray(a[k]) ? new Arr(a[k]) : a[k]
	if(k.startsWith('set_')){c.prototype.sets[k.slice(4)] = v}
	else if(k.startsWith('unset_')){c.prototype.unsets[k.slice(6)] = v}
	else if(typeof a[k] == 'function'){
		props2.value = a[k]
		Object.defineProperty(c.prototype, k, props2)
	}else{
		const jk = JSON.stringify(k)
		c.none._[k] = v
		props.set = v instanceof Arr ? undefined : new Function('a',`let b = this._[${jk}];this._[${jk}] = a;${('set_'+k) in a ? `b = this.sets[${jk}].call(this, a, b);if(b !== undefined)this._[${jk}] = b` : ''};this._set(${jk})`)
		props.get = new Function(`return this._[${jk}]`)
		Object.defineProperty(c.prototype, k, props)
	}
}
function type(c, _a){
	props2.value = {}
	Object.defineProperty(c.prototype, 'sets', props2)
	props2.value = {}
	Object.defineProperty(c.prototype, 'unsets', props2)
	const a = _a.prototype ? new _a : _a
	if(_a.prototype)for(const k of Object.getOwnPropertyNames(_a.prototype))def(c, a, k)
	for(let k in a)def(c, a, k)
	Object.freeze(c.none._)
}
globalThis.declared = function(){
	for(const [c, a] of classes)type(c, a)
}
const styles = new WeakMap
function addChild(d, el){
	if(Array.isArray(el)){
		if(!(el instanceof Element)) for(let e of el)addChild(d, e)
	}else if(el.parentElement)el = el.clone()
	//if(!(el instanceof Node)&&typeof el!='string')throw new TypeError('Expecting either a node or a string as a child')
	if(el.targetname){
		if(d.ckeys){
			if(d.ckeys[el.targetname])d.ckeys[el.targetname].push(el,-1)
			else d.ckeys[el.targetname] = [el, -1]
		}else d.ckeys = {[el.targetname]: [el,-1]}
	}else if(el.ckeys){
		if(d.ckeys){
			for(const i in el.ckeys)
				if(d.ckeys[i])for(const f of el.ckeys[i])d.ckeys[i].push(f)
				else d.ckeys[i] = el.ckeys[i]
		}else d.ckeys = el.ckeys
		el.ckeys = null
	}
	if(Array.isArray(el))d.append.apply(d,el)
	else d.append(el)
}
const stylearr = [0], sheet = document.styleSheets[1]
function insertstyle(rule, prio = 1){
	let s = 0, e = stylearr.length, m
	while(e > s){
		m = (s + e) >>> 1
		if(prio > stylearr[m]) s = ++m
		else if(prio < stylearr[m]) e = m
		else break
	}
	sheet.insertRule(rule, m)
	stylearr.splice(m, 0, prio)
}
globalThis.ff = navigator.userAgent.includes("Firefox")
globalThis.edge = navigator.userAgent.includes("Edge")
globalThis.chrome = navigator.userAgent.includes("Chrome")
globalThis.safari = !ff && !edge && !chrome
const prefix = ff ? 'moz' : edge ? 'ms' : chrome ? 'webkit' : 'Webkit'
let i = 0
const mappings = {size: 'font-size', t: 'top', r: 'right', b: 'bottom', l: 'left', w: 'width', h: 'height', col: 'color', bg: 'background', radius: 'border-radius', shadow: 'box-shadow', font: 'font-family', scrollable: 'overflow', z: 'z-index'}
for(const prop of ({
	Webkit: 'filter backdropFilter'.split(' ')
})[prefix] || []){
	mappings[prop] = '-'+prefix+'-'+prop.replace(/[A-Z]/g,_=>'-'+_.toLowerCase())
}
function prop(v){
	return typeof v == 'number' ? v + 'px' : v.replace(/--[a-zA-Z0-9-]+/g,'var($&)')
}
function process_prop(k, v){
	if(k == 'scrollable')return 'overlay;overflow:auto'
	if(k == 'flex'){
		if(Array.isArray(v))for(let i=v.length-2;i>=0;i--)v[i]+=''
		else if(typeof v == 'string')v='0 '+v
	}else if(k=='z'||k=='opacity'||k=='lineHeight')v+=''
	return Array.isArray(v) ? v.map(prop).join(' ') : prop(v)
}
function styleify(p, cname){
	let rules = []
	for(const k in p){
		if(k == 'hover' || k == 'active' || k == 'focus'){
			if(cname && !(k == 'hover' && 'ontouchend' in document))insertstyle('.'+cname+':'+k+'{'+styleify(p[k])+'}', p.priority === undefined ? p.prio : p.priority)
			continue
		}
		if(k=='prio'||k=='priority')continue
		if(k=='t'||k=='l'||k=='b'||k=='r')rules.push('position:absolute')
		const s = (mappings[k] || k.replace(/[A-Z]/g,_=>'-'+_.toLowerCase()))+':'+process_prop(k, p[k])
		rules.push(s)
	}
	return rules.join(';')
}
function getStyle(p){
	let cname = styles.get(p)
	if(!cname){
		cname = 'a'+(i++)
		styles.set(p, cname)
		insertstyle('.'+cname+'{'+styleify(p, cname)+'}', p.priority === undefined ? p.prio : p.priority)
	}
	return cname
}
Node.prototype.clone = function clone(nkeys){
	const cloned = this.cloneNode()
	if(this.nodeType == Node.TEXT_NODE)return cloned
	if(!nkeys || this.ckeys) cloned.ckeys = nkeys = {}
	if(this.callbacks){
		cloned.callbacks = this.callbacks
		let i = 0
		for(const fn of this.callbacks){
			if(typeof fn.for == 'string'){
				if(nkeys[fn.for])nkeys[fn.for].push(cloned, i)
				else nkeys[fn.for] = [cloned, i]
			}else if(fn.for){
				for(let fr of fn.for){
					if(nkeys[fr])nkeys[fr].push(cloned, i)
					else nkeys[fr] = [cloned, i]
				}
			}
			i++
		}
	}
	if(this.events)cloned.events = this.events
	for(let i of this.children){
		const c = i.clone(nkeys)
		if(i.targetname){
			c.targetname = i.targetname
			if(nkeys[i.targetname])nkeys[i.targetname].push(c, -1)
			else nkeys[i.targetname] = [c, -1]
		}
		cloned.append(c)
	}
	return cloned
}
const s = document.createElement('div')
s.ckeys = null
s.callbacks = null
Element.init = function(tag, c){
	const d = document.createElement(tag)
	for(const p of c){
		if(p instanceof Node || typeof p != 'object')addChild(d, p)
		else if(typeof p == 'object')d.classList.add(getStyle(p))
		else throw new TypeError('Invalid parameter: '+p)
	}
	return d
}
globalThis.Text = (...c) => Element.init('span', c)
globalThis.Paragraph = (...c) => Element.init('p', c)
globalThis.Iframe = (...c) => Element.init('iframe', c)
globalThis.Textarea = (...c) => {
	let d = Element.init('textarea', c)
	d.rows = 1
	d.columns = 1
	d.spellcheck = false
	return d
}
globalThis.Input = (...c) => {
	let d = Element.init('input', c)
	d.spellcheck = false
	return d
}
globalThis.Link = (h, ...c) => {
	let d = Element.init('a', c)
	if(typeof h == 'function') d.on('click', h)
	else d.href = h
	return d
}
globalThis.selectable =	{userSelect: 'text', '-webkitUserSelect':'text'}
globalThis.Flex = (f, ...c) => {
	let d = Element.init('div', c)
	if(d.className)d.className += ' '+f
	else d.className = f
	return d
}
globalThis.Box = (...c) => Element.init('div', c)
globalThis.fixed = {position: 'fixed', prio: 20}
globalThis.Icon = (...c) => Element.init('img', c)
globalThis.Spacer = (f, g = 0) => {
	let d = Element.init('spacer', [])
	d.style.flex = g + ' ' + (typeof f == 'number' ? f + 'px' : f)
	return d
}
HTMLInputElement.prototype.append = HTMLTextAreaElement.prototype.append = function(a){
	if(typeof a == 'number')this.maxLength = a
	else if(this instanceof HTMLInputElement && !this.hasAttribute('type'))this.type = a
	else this.placeholder += a
}
HTMLImageElement.prototype.append = function(a){
	this.src += a
}
Element.prototype.set = function(k, v){
	if(typeof k == 'object'){for(const key in k)this.set(key, k[key]);return this}
	const s = process_prop(k, v)
	this.style.setProperty(mappings[k] || k.replace(/[A-Z]/g,_=>'-'+_.toLowerCase()), s)
	return this
}
Element.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator]
Element.prototype.on = function(ev, fn){
	if(!this.events)this.events = {}
	if(!this.events[ev]){
		if(nobubble.has(ev))this.addEventListener(ev, npev.bind(this))
		this.events[ev] = fn
	}
	else if(typeof this.events[ev] == 'function')this.events[ev] = [this.events[ev], fn]
	else this.events[ev].push(fn)
	return this
}
Element.prototype.changed = function(e, fn){
	if(!this.callbacks)this.callbacks = []
	if(!this.ckeys)this.ckeys = {}
	for(const ev of e.split(' ')){
		if(!this.ckeys[ev])this.ckeys[ev] = [this, this.callbacks.length]
		else this.ckeys[ev].push(this, this.callbacks.length)
		if(!fn.for)fn.for = ev
		else if(typeof fn.for == 'string')fn.for = [fn.for, ev]
		else fn.for.push(ev)
	}
	this.callbacks.push(fn)
	return this
}
globalThis.hidden = {display: 'none', prio: 20}
Element.prototype.if = function(key, pred, style = shown){
	this.changed(key, (me, el) => {
		if(typeof pred == 'function' ? pred(me[key]) : me[key] == pred){
			if(Array.isArray(el))for(const e of el)e.add(style)
			else el.add(style)
		}else if(Array.isArray(el))for(const e of el)e.remove(style)
		else el.remove(style)
		
	})
	return this
}
Element.prototype.toggle = function(o,i){
	if(i===undefined) this.classList.toggle(getStyle(o))
	else if(i)this.classList.add(getStyle(o))
	else this.classList.remove(getStyle(o))
}
Element.prototype.add = function(o){this.classList.add(getStyle(o))}
const rem = Element.prototype.remove
Element.prototype.remove = function(o){if(!o){return rem.call(this)}this.classList.remove(getStyle(o))}
Object.defineProperty(Element.prototype, 'text', Object.getOwnPropertyDescriptor(Node.prototype, 'textContent'))
Object.defineProperty(Element.prototype, 'focused', {get(){return document.activeElement == this},set(a){if(a)this.focus();else this.blur()}})
Element.prototype.for = function(ev){
	const t = this.parentElement ? this.clone() : this
	t.targetname = ev
	return t
}
function npev(e){
	const name = e.type
	let t = this
	while(!t.target)t = t.parentElement
	if(this.events[name])try{this.events[name].call(this, t.target, this, e)}catch(e){console.error(e)}
}
function pev(i, e){
	const name = e.type
	if(i.events[name])try{i.events[name].call(i, i.target, i.obj, e)}catch(e){console.error(e)}
}
function hev(e){
	const name = e.type
	let t = e.target
	let n = []
	while(t != document.documentElement){
		if(t.events)n.push(t)
		if(t.target){
			for(let i of n){
				try{if(i.events[name] ? i.events[name].call(i, t.target, i) : false)return}catch(e){console.error(e)}
				if(!e.bubbles)return
			}
			n = []
		}
		t = t.parentElement
	}
}
document.addEventListener('click', hev)
//todo: more events including gesture events
document.addEventListener('dragstart', e => console.log(e.preventDefault()))
document.addEventListener('touchend', function(e){
	if(!e.cancelable)return
	e.preventDefault()
	e.target.dispatchEvent(new MouseEvent('click', {clientX: e.changedTouches[0].clientX, clientY: e.changedTouches[0].clientY, bubbles: true}))
	e.target.focus()
})
document.addEventListener('mousewheel', function(e){
	if(e.ctrlKey)e.preventDefault()
}, {passive: false})
document.addEventListener('contextmenu', e => e.preventDefault())
document.render = function(a){
	if(a)a.id = 'app'
	if(chrome || edge){
		document.body.innerHTML = ''
		document.body.append(a)
	}else document.body.replaceWith(a)
}
const nobubble = new Set('message open input enter change keydown keyup keypress scroll load mouseover blur'.split(' '))
globalThis.Mirror = function(a, ...c){
	if(!this)return new Mirror(a,...c)
	this.callbacks = []
	this.ckeys = {}
	this.events = {}
	this.obj = null
	if(!(a instanceof Mirror)){
		this.fn = a
	}else{
		if(!a.targetname)throw new Error('Mirror child must have a target (missing a .for(...) somewhere)')
		if(!this.ckeys[a.targetname])this.ckeys[a.targetname] = [m, -1]
		else this.ckeys[a.targetname].push(m, -1)
		if(!a.fn)a.fn = this
	}
	for(const m of c){
		if(!m.targetname)throw new Error('Mirror child must have a target (missing a .for(...) somewhere)')
		if(!this.ckeys[m.targetname])this.ckeys[m.targetname] = [m, -1]
		else this.ckeys[m.targetname].push(m, -1)
		if(!m.fn)m.fn = this
	}
}
Object.defineProperty(Mirror.prototype, 'target', {
	get(){ return null },
	set(a){
		this.obj = this.fn.obj || this.fn(a)
		if(!this.fn.obj)for(const k in this.events)if(nobubble.has(k))this.obj.addEventListener(k, pev.bind(undefined, this))
		this.obj.fire = this.fire.bind(this)
	}
})
Mirror.prototype.for = function(a){
	const t = this._target ? this.clone() : this
	t.targetname = a
	return t
}
Mirror.prototype.changed = function(ev,fn){
	if(!this.ckeys[ev])this.ckeys[ev] = [this, this.callbacks.length]
	else this.ckeys[ev].push(this, this.callbacks.length)
	this.callbacks.push(fn)
	return this
}
Mirror.prototype.clone = function(){
	const m = new Mirror(this.fn)
	m.ckeys = this.ckeys
	m.events = this.events
	m.callbacks = this.callbacks
	return m
}
Mirror.prototype.on = function(ev, fn){
	if(nobubble.has(ev) && !this.events[ev] && this.obj)this.obj.addEventListener(ev, pev.bind(undefined, this))
	if(!this.events[ev])this.events[ev] = fn
	else if(typeof this.events[ev] == 'function')this.events[ev] = [this.events[ev], fn]
	else this.events[ev].push(fn)
	return this
}
Mirror.prototype.fire = function(ev, t, e){
	if(!o)console.warn('No such object with ID',t)
	else if(this.events[ev])try{this.events[ev].call(this, o, this.obj, e)}catch(e){console.error(e)}
}
Mirror.prototype.replaceWith=()=>{}
Mirror.prototype.insertAdjacentElement=()=>{}
Object.defineProperty(Array.prototype, 'call', {value(thisArg, ...args){
	for(const f of this)f.call(thisArg, ...args)
}, enumerable: false})
Object.defineProperty(Array.prototype, 'apply', {value(thisArg, args){
	for(const f of this)f.apply(thisArg, args)
}, enumerable: false})
const comment = document.createComment('') //in v8, cloneNode is faster than createElement
//array that supports rendering

function added(t, k, i){
	if(t.sets[k])try{t.sets[k].call(t, i, t)}catch(e){console.error(e)}
	for(const m of t.mirrors){
		if(m.ckeys){
			const arr = m.ckeys[k]
			if(arr)for(let i = 0; i < arr.length; i += 2){
				const el = arr[i], idx = arr[i+1]
				if(idx != -1) try{el.callbacks[idx].call(el, t, el.obj || el)}catch(e){console.error(e)}
			}
		}
	}
}
function removed(t, k, i){
	if(t.unsets[k])try{t.unsets[k].call(t, i, t)}catch(e){console.error(e)}
	for(const m of t.mirrors){
		if(m.ckeys){
			const arr = m.ckeys[k]
			if(arr)for(let i = 0; i < arr.length; i += 2){
				const el = arr[i], idx = arr[i+1]
				if(idx != -1) try{el.callbacks[idx].call(el, t, el.obj || el)}catch(e){console.error(e)}
			}
		}
	}
}

//duplicate `id`s cause undefined behaviour for now
globalThis.Arr = class Arr{
	constructor(a){
		this.arr = a
		this.map = new Map
		for(const itm of a){
			if(itm.id)this.map.set(itm.id, itm)
		}
		this.mirrors = new Map
	}
	push(itm){
		for(const m of this.mirrors.values()){
			if(!this.length){
				m[0].replaceWith(m[0] = itm.mirror(m[0].original))
			}else{
				let n = itm.mirror(m[0])
				m[m.length-1].insertAdjacentElement('afterend', n)
				m.push(n)
			}
		}
		if(itm.id)this.map.set(itm.id, itm)
		this.arr.push(itm)
		added(this.top, this.key, itm)
	}
	insert(itm, i = this.arr.length){
		if(i!=(i=i>>>0)||i>this.arr.length)return
		for(const m of this.mirrors.values()){
			if(!this.length){
				m[0].replaceWith(m[0] = itm.mirror(m[0].original))
			}else if(!i){
				let n = itm.mirror(m[0])
				m[0].insertAdjacentElement('beforebegin', n)
				m.unshift(n)
			}else{
				let n = itm.mirror(m[0])
				m[i - 1].insertAdjacentElement('afterend', n)
				m.splice(i, 0, n)
			}
		}
		if(itm.id)this.map.set(itm.id, itm)
		this.arr.splice(i, 0, itm)
		added(this.top, this.key, itm)
	}
	get length(){return this.arr.length}
	at(i){return this.arr[+i]}
	set(i, v){
		if(i!=(i=i>>>0)||i>=this.arr.length)return
		for(const m of this.mirrors.values()){
			this.arr[i].unmirror(m[i])
			v.mirror(m[i])
		}
		if(v.id)this.map.set(v.id, itm)
		if(this.arr[i].id)this.map.delete(this.arr[i].id)
		removed(this.top, this.key, this.arr[i])
		this.arr[i] = v
		added(this.top, this.key, v)
		return v
	}
	delete(a){this.remove(this.arr.indexOf(a))}
	remove(i){
		if(i!=(i=i>>>0)||i>=this.arr.length)return
		if(this.length == 1){
			for(const [k, m] of this.mirrors){
				this.arr[i].unmirror(m[i])
				const br = comment.cloneNode()
				br.original = k
				m[0].replaceWith(br)
				m[0] = br
			}
		}else for(const m of this.mirrors.values()){
			this.arr[i].unmirror(m[i])
			m[i].remove()
			m.splice(i, 1)
		}
		if(this.arr[i].id)this.map.delete(this.arr[i].id)
		removed(this.top, this.key, this.arr[i])
		this.arr.splice(i, 1)
	}
	empty(){
		if(!this.arr.length)return
		for(const [k, m] of this.mirrors){
			const br = comment.cloneNode()
			br.original = k
			m[0].replaceWith(br)
			for(let i = 0; i < this.length; i++){
				this.arr[i].unmirror(m[i])
				m[i].remove()
			}
			m.length = 1
			m[0] = br
		}
		for(const i of this.arr)removed(this.top, this.key, i)
		this.map.clear()
		this.arr.length = 0
	}
	get(id){return this.map.get(id)}
	has(id){return this.map.has(id)}
	mirror(m){
		if((m instanceof Node) && !m.parentElement)throw new Error('Illegal rendering of Array to a node which has no parent')
		if(this.length){
			const arr = [this.arr[0].mirror(m)]
			this.mirrors.set(m, arr)
			for(let i = 1; i < this.arr.length; i++){
				const n = this.arr[i].mirror(m)
				arr.push(n)
				arr[i-1].insertAdjacentElement('afterend', n)
			}
		}else{
			const br = comment.cloneNode()
			br.original = m
			m.replaceWith(br)
			this.mirrors.set(m, [br])
		}
	}
	unmirror(m){
		let i = 0
		if(this.arr.length)for(const e of this.mirrors.get(m)){
			this.arr[i].unmirror(e)
			if(i == 0)e.replaceWith(m)
			else e.remove()
			i++
		}else this.mirrors.get(m)[0].replaceWith(m)
		this.mirrors.delete(m)
	}
	[Symbol.iterator](){return this.arr[Symbol.iterator]()}
	toJSON(){return this.arr}
	_clone(){
		const res = []
		for(const i of this.arr){
			if(i && i._clone)res.push(i._clone())
			else res.push(i)
		}
		return new this.constructor(res)
	}
}
globalThis.post = globalThis.webkit && webkit.messageHandlers ? (name, data)=>{
	webkit.messageHandlers[name].postMessage(data)
} : () => {}
post('statusbar', '')
globalThis.muid = function(){
	let r = crypto.getRandomValues(new Uint32Array(3))
	return Date.now().toString(16) + r[0].toString(16).padStart(8,'0')+r[1].toString(16).padStart(8,'0')+(r[2]|0x10000).toString(16).slice(-4)
}
globalThis.muidtime = function(a){
	return parseInt(a.slice(0, -20), 16)
}
const B = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
globalThis.muid2 = () => {
	let n = Date.now(), m = Math.random() * 0x40000000;
	return B[n&63]+B[(n=Math.floor(n/64))&63]+B[(n>>=6)&63]+B[(n>>=6)&63]+B[(n>>=6)&63]+B[(n>>=6)&63]+B[n>>6]+B[m&63]+B[(m>>=6)&63]+B[(m>>=6)&63]+B[(m>>=6)&63]+B[(m>>=6)&63]
}
globalThis.scrollable = ''

globalThis.font = (k,url) => {
	const format = url.match(/(?:.(\w+)$)?/)[1] || ''
	sheet.insertRule(`@font-face{font-family:${k};src:url(${url})${format?' format('+format+')':''}}`)
	return k
}
const res = []
const {port1, port2} = new MessageChannel()
port2.onmessage = function({data: i}){
	res[i]()
	res[i] = null
	i = res.length
	while(i && !res[--i])res.pop()
}
const put = r => {
	const i = res.indexOf(null) || res.push(null)
	res[i] = r
	port1.postMessage(i)
}
Object.defineProperty(globalThis, 'defer', {get: () => new Promise(put)})

String.prototype.hashCode = function(hash = 604537145){
  for (let i = this.length; i--;){
		hash ^= this.charCodeAt(i)
		hash ^= hash << 7
		hash ^= hash >> 5
	}
  return hash
}

for(const List of [NodeList, HTMLCollection, DataTransferItemList, FileList, DOMStringList, DOMTokenList, CSSRuleList, DOMRectList]) Object.setPrototypeOf(List.prototype, Array.prototype)
Object.defineProperty(Set.prototype, '_clone', {value(){return new Set(this)},enumerable:false})
Object.defineProperty(Map.prototype, '_clone', {value(){return new Map(this)},enumerable:false})

//onkeydown=e=>void((e.ctrlKey||e.metaKey)&&e.key=='r'&&(e.preventDefault(),location.reload()))