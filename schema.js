const idof = a => a._id
const types = Object.create(null)
export function addType(fn, name, o){
	types[name] = fn
	fn._name = name
	fn.schema = o
}
export function parse(data, bucket){
	if(data === undefined)return null
	let dat = data.split('\n')
	let a = dat[0].split(' ', 2)
	const id = +a[0]
	if(a.length < 2)return bucket.delete(id)
	const Type = types[a[1]]
	const save = Type.schema
	let obj = bucket.get(+id)
	if(!obj){
		//we dont have this object. create it
		obj = new Type({}, id)
		bucket.set(id, obj)
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
				let obj = bucket.get(id)
				if(!obj){
					obj = new T({}, id)
					bucket.set(id, obj)
				}
				if(i[0] == '~')res.delete(obj)
				else res.push(obj)
			}
		}else if(T.schema){
			const id = +v
			let o = bucket.get(id)
			if(o)obj[i] = o
			else if(id != id){obj[i] = null}else{
				o = new T({}, id)
				bucket.set(id, o)
				obj[i] = o
			}
		}else if(T == String)obj[i] = JSON.parse(v)
		else obj[i] = T == Number ? +v : !!+v
	}
	return obj
}
export const Schema = (f, o, r=f.bind()) => (r.schema=o,r._name=f._name,r)