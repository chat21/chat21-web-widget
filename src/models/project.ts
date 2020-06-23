export class ProjectModel {
    constructor(
        public id?: string,
        public activeOperatingHours?: boolean,
        public channels?: [any],
        public name?: string,
        public createdAt?: string,
        public createdBy?: string,
        public isActiveSubscription?: boolean,
        public profile?: any,
        public agents?: number,
        public trialDays?: number,
        public type?: string,
        public status?: number,
        public trialDaysLeft?: number,
        public trialExpired?: boolean,
        public updatedAt?: string,
        public versions?: string,
        public widgetTitle?: string,
        public logoChat?: string,
        public avatar?: string,
        public color?: string,
        public welcomeTitle?: string,
        public welcomeMsg?: string,
    ) { }

    initialize (
        id?: string,
        activeOperatingHours?: boolean,
        channels?: [any],
        name?: string,
        createdAt?: string,
        createdBy?: string,
        isActiveSubscription?: boolean,
        profile?: any,
        agents?: number,
        trialDays?: number,
        type?: string,
        status?: number,
        trialDaysLeft?: number,
        trialExpired?: boolean,
        updatedAt?: string,
        versions?: string
    ) {
        this.id = id;
        this.activeOperatingHours = activeOperatingHours;
        this.channels = channels;
        this.name = name;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
        this.isActiveSubscription = isActiveSubscription;
        this.profile = profile;
        this.agents = agents;
        this.trialDays = trialDays;
        this.type = type;
        this.status = status;
        this.trialDaysLeft = trialDaysLeft;
        this.trialExpired = trialExpired;
        this.updatedAt = updatedAt;
        this.versions = versions;
    }

    customization (
        widgetTitle: string,
        logoChat: string,
        avatar: string,
        color: string,
        welcomeTitle: string,
        welcomeMsg: string
    ) {
        this.widgetTitle = widgetTitle;
        this.logoChat = logoChat;
        this.avatar = avatar;
        this.color = color;
        this.welcomeTitle = welcomeTitle;
        this.welcomeMsg = welcomeMsg;
    }
 }
