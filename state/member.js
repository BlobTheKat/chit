export const Member = Type(class{
	id = ''
	icon = ''
	perms = 1
	lastSign = 0
	perk = 0
	mg = null
	set_perms(a){
		if(this.mg)this.mg.perms = a
	}
})

/*
//Little thing for hashing some names to what we want
const names = {'@blobkat': 0, '@zekiah': 2, '@cyart': 0, '@raidtheweb': 3}
let i = 0
w: while(true){
  i = Math.random() * 4294967296 | 0
  for(let k in names)if((k.hashCode(i) & 7) != names[k])continue w
  break w
}
console.log(i)
*/