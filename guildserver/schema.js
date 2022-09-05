//todo: stringify for focus group
globalThis.bucket = new Map
const idof = a => a._id
const types = Object.create(null)
export function addType(fn, name, o){
	types[name] = fn
	fn._name = name
	fn.schema = o
}
export function stringify(obj, Type){
	const res = [obj._id+' '+obj.constructor._name]
	const save = Type.schema
	for(let i in save){
		let v = obj[i], T = save[i]
		if(Array.isArray(T)){
			T = T[0]
			if(!v.arr.length)res.push(i)
			else{
				let j = v.arr.map(idof).join(' ')
				res.push(i+' '+j)
			}
		}else if(T.schema){
			res.push(i+' '+v._id)
		}else if(save[i] == String) res.push(i+' '+JSON.stringify(''+v))
		else res.push(i+' '+ +v)
	}
	return res.join('\n')
	//57
	//name "Chitdev!"
	//icon "..."
	//channels 94 95 96
}
const res = new Map
function _stringifyAll(a){
	const type = a.constructor
	for(let i in type.schema){
		const T = type.schema[i], v = a[i]
		if(T.schema && v && !res.has(v._id)){
			res.set(v._id, _stringifyAll(v, res))
		}else if(T[0]){
			for(const val of v){
				res.set(val._id, _stringifyAll(val, res))
			}
		}
	}
	return stringify(a, type)
}
export function stringifyAll(a){
	res.set(a._id, _stringifyAll(a))
	const r = [...res.values()].join('\n\n')
	res.clear()
	return r
}
globalThis.localbucket = globalThis.document ? bucket : new Map
export function parse(data){
	if(data === undefined)return null
	let dat = data.split('\n')
	let a = dat[0].split(' ', 2)
	const id = +a[0]
	const Type = types[a[1]]
	const save = Type.schema
	let obj = localbucket.get(+id)
	if(!obj){
		obj = new Type({}, id)
		localbucket.set(id, obj)
	}
	for(let v of dat.slice(1)){
		const idx = v.indexOf(' ') + 1 || v.length + 1
		const i = v.slice(0, idx - 1)
		v = v.slice(idx)
		let T = save[i]
		if(Array.isArray(T)){
			T = T[0]
			if(!T.schema)throw "arrays must contain only objects"
			let res = obj[i]
			if(!res)obj[i] = res = new Arr([])
		 	if(v)for(const i of v.split(' ')){
				const id = +i || +i.slice(1)
				let obj = localbucket.get(id)
				if(!obj){
					obj = new T({}, id)
					localbucket.set(id, obj)
				}
				if(i[0] == '~')res.delete(obj)
				else res.push(obj)
			}
		}else if(T.schema){
			const id = +v
			let o = localbucket.get(id)
			if(o)obj[i] = o
			else if(id != id){obj[i] = null}else{
				o = new T({}, id)
				localbucket.set(id, o)
				obj[i] = o
			}
		}else if(T == String)obj[i] = JSON.parse(v)
		else obj[i] = T == Number ? +v : !!+v
	}
	return obj
}
export const Schema = (f, o, r=f.bind()) => (r.schema=o,r._name=f._name,r)