import { stringify } from "./schema.js"
const props2 = {enumerable:false,value: null}, props = { get: null, set: null }
let j = 0
const sends = new Set
let fac = b=>class{
	constructor(a = {}, _id = j++){
		if(_id >= j)j = _id + 1
		this._ = a
		this._id = _id
		this.mirrors = new Map
		for(const k in b){
			if(!(k in a))a[k] = b[k] && b[k]._clone ? b[k]._clone() : b[k]
			if(Array.isArray(a[k]))a[k] = new Arr(a[k])
			if(a[k] instanceof Arr)a[k].top = this, a[k].key = k
			if(a[k] instanceof MirrorGroup){
				a[k].target = this
				this.mirror(a[k])
			}
		}
	}
	_unset(k, old){
		if(this[k] instanceof Arr){
			for(const m of this.mirrors.keys())if(k in m.schema)for(const w of m.sockets){
				const T = m.schema[k]
				if(!T[0])continue
				w.send(`${this._id} ${this.constructor._name}\n${k} ~${old._id}`)
			}
		}
		if(old && old.mirrors){
			for(const m of this.mirrors.keys()){
				const mir = m.schema[k]
				if(!mir)continue
				old.unmirror(mir[0] || mir)
			}
		}
	}
	_set(k, nw){
		if(nw && nw.mirrors){
			for(const m of this.mirrors.keys()){
				const mir = m.schema[k]
				if(!mir)continue
				nw.mirror(mir[0] || mir)
			}
		}
		const a = `${this._id} ${this.constructor._name}\n${k} `
		for(const m of this.mirrors.keys()){
			const T = m.schema[k]
			if(!T)continue
			for(const w of m.sockets)w.send(a+(T[0] || T.schema ? nw._id : T == String ? JSON.stringify(nw) : +nw))
		}
		if(this.ws)for(const w of this.ws){
			const T = this.constructor.schema[k]
			if(!T)continue
			w.send(a+(T[0] || T.schema ? nw._id : T == String ? JSON.stringify(nw) : +nw))
		}
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
	mirror(a){
		if(this.mirrors.size == 0)bucket.set(this._id, this)
		for(const k in a.schema){
			const v = this._[k]
			if(v && v.mirrors)v.mirror(a.schema[k])
		}
		const i = this.mirrors.get(a)
		if(!i){
			a: for(const w of a.sockets){
				for(const m of w.mirrors)if(this.mirrors.has(m))continue a
				w.send(stringify(this, a))
			}
			this.mirrors.set(a, 1)
		}else this.mirrors.set(a, i + 1)
	}
	unmirror(a){
		for(const k in a.schema){
			const v = this._[k]
			if(v && v.mirrors)v.unmirror(a.schema[k])
		}
		const i = this.mirrors.get(a)
		if(!i)return
		if(i == 1){
			this.mirrors.delete(a)
			a: for(const w of a.sockets){
				for(const m of w.mirrors)if(this.mirrors.has(m))continue a
				w.send(''+this._id)
			}
		}else this.mirrors.set(a, i - 1)
		if(this.mirrors.size == 0)bucket.delete(this._id)
	}
	toJSON(){return this._id}
	[Symbol.for('nodejs.util.inspect.custom')](){
		return this._
	}
}
let getarr = (a) => [...a]
globalThis.Type = function(a){
	const t = {}
	const c = fac(t)
	props2.value = {}
	Object.defineProperty(c.prototype, 'sets', props2)
	props2.value = {}
	Object.defineProperty(c.prototype, 'unsets', props2)
	
	for(let k in a){
		const v = a[k]
		if(k.startsWith('set_')){c.prototype.sets[k.slice(4)] = v}
		else if(k.startsWith('unset_')){c.prototype.unsets[k.slice(6)] = v}
		else if(typeof v == 'function'){
			props2.value = v
			Object.defineProperty(c.prototype, k, props2)
		}else{
			props.set = undefined
			const jk = JSON.stringify(k)
			if(Array.isArray(v))Object.defineProperty(t,k,{get: getarr.bind(undefined, v),enumerable:true})
			else t[k] = v, props.set = new Function('a',`const old = this._[${jk}];`+(('unset_'+k) in a ? `this.unsets[${jk}].call(this, old, this);` : '')+`this._unset(${jk},old);this._[${jk}] = a;${('set_'+k) in a ? `this.sets[${jk}].call(this, a, this);` : ''}this._set(${jk},a)`)
			props.get = new Function(`return this._[${jk}]`)
			Object.defineProperty(c.prototype, k, props)
		}
	}
	c.none = new c({}, -Infinity)
	Object.freeze(c.none._)
	return c
}

function added(t, k, i){ if(t.sets[k])t.sets[k].call(t, i, t) }
function removed(t, k, i){ if(t.unsets[k])t.unsets[k].call(t, i, t) }

globalThis.Arr = class Arr{
	constructor(a){
		this.arr = a
		this.map = new Map
		for(const itm of a){
			if(itm.id)this.map.set(itm.id, itm)
		}
	}
	push(itm){
		if(itm.id)this.map.set(itm.id, itm)
		this.arr.push(itm)
		this.top._set(this.key, itm)
		added(this.top, this.key, itm)
	}
	insert(itm, i = this.arr.length){
		if(i!=(i=i>>>0)||i>this.arr.length)return
		if(itm.id)this.map.set(itm.id, itm)
		this.arr.splice(i, 0, itm)
		this.top._set(this.key, itm)
		added(this.top, this.key, itm)
	}
	get length(){return this.arr.length}
	at(i){return this.arr[+i]}
	set(i, v){
		if(i!=(i=i>>>0)||i>=this.arr.length)return
		if(v.id)this.map.set(v.id, itm)
		if(this.arr[i].id)this.map.delete(this.arr[i].id)
		this.top._unset(this.key, this.arr[i])
		removed(this.top, this.key, this.arr[i])
		this.arr[i] = v
		added(this.top, this.key, v)
		this.top._set(this.key, v)
		return v
	}
	delete(a){this.remove(this.arr.indexOf(a))}
	remove(i){
		if(i!=(i=i>>>0)||i>=this.arr.length)return
		if(this.arr[i].id)this.map.delete(this.arr[i].id)
		this.top._unset(this.key, this.arr[i])
		removed(this.top, this.key, this.arr[i])
		this.arr.splice(i, 1)
	}
	empty(){
		if(!this.arr.length)return
		for(const i of this.arr)removed(this.top, this.key, i)
		this.map.clear()
		this.arr.length = 0
	}
	get(id){return this.map.get(id)}
	has(id){return this.map.has(id)}
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
	[Symbol.for('nodejs.util.inspect.custom')](){
		return this.arr
	}
}

//for focus sets
Object.defineProperty(Set.prototype, '_clone', {value(){return new Set(this)},enumerable:false})
Object.defineProperty(Map.prototype, '_clone', {value(){return new Map(this)},enumerable:false})
let jj=0, idd=0;globalThis.mirrs=[]
globalThis.MirrorGroup = class MirrorGroup{
	constructor(obj, s = new Set, or = this, i = jj++){
		this.i=i;this.idd=idd++
		mirrs[this.idd]=this
		this.original = or
		this.sockets = s
		const t = {}
		for(const k in obj){
			const o = obj[k]
			if(Array.isArray(o)){
				if(o[0].schema)t[k] = [new MirrorGroup(o[0].schema, s, or, i)]
			}else if(o && o.schema)t[k] = new MirrorGroup(o.schema, s, or, i)
			else t[k] = o
		}
		this.schema = t
	}
	_add(ws, target){
		for(const k in this.schema){
			const v = target._[k]
			if(v && v.mirrors)this._add.call(this.schema[k], ws, v)
			else if(v && v.arr)for(let val of v.arr){
				this._add.call(this.schema[k][0], ws, val)
			}
		}
		for(let m of ws.mirrors)if(m.i == this.i)return
		ws.send(stringify(target, this))
	}
	_remove(ws, target){
		for(const k in this.schema){
			const v = target._[k]
			if(v && v.mirrors)this._remove.call(this.schema[k], ws, v)
			else if(v && v.arr)for(let val of v.arr){
				this._remove.call(this.schema[k][0], ws, val)
			}
		}
		for(let m of target.mirrors.keys())if(ws.mirrors.has(m.original))return
		ws.send(''+target._id)
	}
	add(ws){
		const t = this.target
		if(!t)return
		this._add(ws, t)
		ws.mirrors.add(this)
		this.sockets.add(ws)
	}
	delete(ws){
		const t = this.target
		if(!t)return
		ws.mirrors.delete(this)
		this.sockets.delete(ws)
		this._remove(ws, t)
	}
	_clone(){
		return new MirrorGroup(this.schema,undefined,undefined,this.i)
	}
	[Symbol.for('nodejs.util.inspect.custom')](){
		return '<Mirror Group: '+this.sockets.size+' sockets ('+this.idd+')>'
	}
}
const ar = ['', '']
String.prototype.split1 = function(a){
	let i = this.indexOf(a)
	if(i < 0)i = this.length
	ar[1] = this.slice(i + 1)
	ar[0] = this.slice(0, i)
	return ar
}