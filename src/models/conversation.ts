export class ConversationModel {
    constructor(
        public uid: string,
        public attributes: any,
        public channel_type: string,
        public is_new: boolean,
        public last_message_text: string,
        public recipient: string,
        public recipient_fullname: string,
        public sender: string,
        public sender_fullname: string,
        public status: string,
        public timestamp: number,
        public type: string,
        public time_last_message: string,
        public color: string,
        public avatar: string,
        public image: string,
        public badge: number,
        public archived: boolean
    ) {}
}
