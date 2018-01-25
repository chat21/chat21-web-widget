export class MessageModel {
    constructor(
        public uid: string,
        public language: string,
        public recipient: string,
        public recipient_fullname: string,
        public sender: string,
        public sender_fullname: string,
        public status: string,
        public text: string,
        public timestamp: string,
        public headerDate: string,
        public type: string
    ) { }
 }
