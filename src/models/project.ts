export class ProjectModel {
    constructor(
        public uid: string,
        public widgetTitle: string,
        public logoChat: string,
        public avatar: string,
        public color: string,
        public welcomeTitle: string,
        public welcomeMsg: string
    ) { }

    init(
        uid: string,
        widgetTitle: string,
        logoChat: string,
        avatar: string,
        color: string,
        welcomeTitle: string,
        welcomeMsg: string
    ) {
        this.uid = uid;
        this.widgetTitle = widgetTitle;
        this.logoChat = logoChat;
        this.avatar = avatar;
        this.color = color;
        this.welcomeTitle = welcomeTitle;
        this.welcomeMsg = welcomeMsg;
    }
 }
