export class ConversationModel {
  constructor(
    public uid: string,
    public attributes: any,
    public channel_type: string,
    public conversation_with_fullname: string,
    public recipient: string,
    public recipient_fullname: string,
    public image: string,
    public is_new: boolean,
    public last_message_text: string,
    public sender: string,
    public senderAuthInfo: any,
    public sender_fullname: string,
    public status: string,
    public timestamp: string,
    public time_last_message: string,
    public selected: boolean,
    public color: string,
    public avatar: string,
    public archived: boolean
  ) { }
}
