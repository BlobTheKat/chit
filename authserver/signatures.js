import s from 'sodium-plus'
import {promises as fs} from "fs"
const sodium = await s.SodiumPlus.auto()
const key = await sodium.crypto_box_keypair()
key.buffer.set(await fs.readFile('../../key'))
const sec = await sodium.crypto_box_secretkey(key)
const pub = await sodium.crypto_box_publickey(key)
const nonce = Buffer.from('YOcKVAiq2Z7GrDVJhbNlNJPn85Z7Zgio', 'base64')
export const maketoken = async id => {
	const buf = await sodium.randombytes_buf(24)
	return buf.toString('base64')+'.'+(await sodium.crypto_box(id, buf, sec, pub)).toString('base64')
}
export const verify = async (id, token) => {
	const [nonce, buf] = token.split1('.')
	try{return (await sodium.crypto_box_open(Buffer.from(buf, 'base64'), Buffer.from(nonce, 'base64'), sec, pub)) == id}catch(e){return false}
}
export async function sign(ws, guildid, bits){
	if(guildid[0] != '#' || guildid.length > 31)return
	bits >>>= 0
	const {data, id} = ws
	if(data.lastsign >= NOW)return ws.send("signerr\nCool it! Limit is 1 transaction / sec")
	if(bits > data.bits)return ws.send("signerr\nNot enough bits!")
	if(data.signature)return ws.send("signerr\n"+data.signature)
	data.lastsign = NOW
	const sig = id + ':' + guildid + ':' + NOW + ':' + bits
	ws.send('sign\n' + (data.signature = sig + ':' + (await sodium.crypto_box(sig, nonce, sec, pub)).toString('base64')))
	for(const w of data.sockets)w.send('bits\n'+data.bits)
}
export async function errSignature(data, sig){
	//error occured; refund signature
	if(!data.signature)return
	const [id, g, n, b] = data.signature.split(':', 4)
	try{
		const [u, g2, n2, s] = (await sodium.crypto_box_open(Buffer.from(sig, 'base64'), nonce, sec, pub)).toString().split(':')
		if(u != id || n != n2 || g != g2)return
		data.signature = ''
		if(!+s)data.bits -= +b
		for(const w of data.sockets)w.send('bits\n'+data.bits)
	}catch(e){}
}