const canvas = document.createElement('canvas')
const i = document.createElement('input')
i.type = 'file'
const ctx = canvas.getContext('2d')
export async function askfile(accept){
	i.accept = accept
	if(i.onchange)i.onchange()
	i.click()
	if(await new Promise(r => i.onchange = r))return i.files[0]
}
export async function fileToFixedImg(file, w = 64, h = w){
	if(!file)return
	const reader = new FileReader()
	let p = new Promise(r => reader.onload = r)
	reader.readAsDataURL(file)
	const image = new Image()
	const q = new Promise(r => image.onload = r)
	image.src = (await p).target.result
	await q
	canvas.width = w; canvas.height = h
	let offx = 0, offy = 0
	if(image.width > image.height)offx = Math.floor((image.width - image.height) * w * .5 / image.height)
	else if(image.height > image.width)offy = Math.floor((image.height - image.width) * h * .5 / image.width)
	ctx.clearRect(0,0,w,h)
	ctx.imageSmoothingEnabled = Math.min(image.width / w, image.height / h) >= 1
	ctx.drawImage(image, -offx, -offy, offx * 2 + w, offy * 2 + h)
	//todo: packet
	return canvas.toDataURL('image/webp').replace(/[\/\+]/g, a => a == '/' ? '_' : '-')
}