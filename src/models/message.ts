// firebase
import * as firebase from 'firebase/app';
import 'firebase/database';

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
        public timestamp: any,
        public headerDate: string,
        public type: string,
        public attributes: any,
        public channel_type: string,
        public projectid: string
    ) { }

    asFirebaseMessage(): Object {
        const message = {
            language: this.language,
            recipient: this.recipient,
            recipient_fullname: this.recipient_fullname,
            sender: this.sender,
            sender_fullname: this.sender_fullname,
            status: this.status,
            metadata: this.metadata,
            text: this.text,
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            // headerDate: this.headerDate,
            type: this.type,
            attributes: this.attributes,
            channel_type: this.channel_type,
            projectid: this.projectid
        };

        return message;
     }
 }
