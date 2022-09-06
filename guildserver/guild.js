import { addType, Schema } from "./schema.js"

export const Member = Type({
	id: '',
	icon: '',
	perms: 1,
	lastSeen: 0,
	lastsign: 0,
	perk: 0,
	ws: new Set
})
export const Message = Type({
	content: '',
	author: Member.none
})
addType(Message, 'm', {
	content: String,
	author: Member
})
export const Channel = Type({
	id: '',
	type: '',
	level: 1,
	bits: 0,
	messages: [],
	focus: new MirrorGroup({
		messages: [Message]
	})
})
export const Guild = Type({
	newchannel: false,
	id: '',
	name: '',
	icon: '',
	channels: [],
	members: [],
	me: null,
	bits: 0,
	level: 1,
	upgrading: 0,
	membercount: 0,
	focus: new MirrorGroup({
		name: String,
		icon: String,
	}),
	focus2: new MirrorGroup({
		channels: [Schema(Channel, {
			id: String,
			type: String,
			bits: Number,
			level: Number
		})],
		me: Member,
		bits: Number,
		level: Number,
		upgrading: Number,
		newchannel: Boolean,
		membercount: Number
	}),
})
addType(Channel, 'c', {
	id: String,
	type: String,
	level: Number,
	bits: Number,
	messages: [Message]
})
addType(Guild, 'g', {
	name: String,
	icon: String,
	bits: Number,
	level: Number,
	upgrading: Number,
	newchannel: Boolean,
	membercount: Number,
	channels: [Channel],
	members: [Member]
})
addType(Member, 'M', {
	id: String,
	icon: String,
	perms: Number,
	lastsign: Number,
	perk: Number
})