import { Channel } from "./channel.js";
import { Member } from "./member.js";

export const Message = Type(class{
	content = ''
	id = ''
	author = Member.none
	channel = Channel.none
})