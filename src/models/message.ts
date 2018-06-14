export class MessageModel {
    constructor(
        public uid: string,
        public language: string,
        public recipient: string,
        public recipient_fullname: string,
        public sender: string,
        public sender_fullname: string,
        public status: string,
        public metadata: any,
        public text: string,
        public timestamp: number,
        public headerDate: string,
        public type: string,
        public attributes: any,
        public channel_type: string,
        public projectid: string
    ) { }
 }
