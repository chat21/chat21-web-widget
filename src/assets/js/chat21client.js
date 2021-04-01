/*
    Chat21Client
    v. 0.1.2
    (c) Tiledesk 2020
*/

const _CLIENTADDED = "/clientadded"
const _CLIENTUPDATED = "/clientupdated"
const _CLIENTDELETED = "/clientdeleted"
const CALLBACK_TYPE_ON_MESSAGE_UPDATED_FOR_CONVERSATION = "onMessageUpdatedForConversation"
const CALLBACK_TYPE_ON_MESSAGE_ADDED_FOR_CONVERSATION = "onMessageAddedForConversation"

class Chat21Client {
    
    constructor(options) {
        this.client = null;
        this.reconnections = 0 // just to check how many reconnections
        this.client_id = Date.now();
        if (options && options.MQTTendpoint) {
            this.endpoint = options.MQTTendpoint
        }
        else {
            this.endpoint = "ws://34.253.207.0:15675/ws"
        }
        this.APIendpoint = options.APIendpoint
        this.appid = options.appId
        // console.log("final endpoint:", this.endpoint)
        this.user_id = null;
        this.jwt = null;
        this.last_handler = 0;
        
        // this.onMessageCallbacks = new Map();
        this.onConnectCallbacks = new Map();
        
        this.onConversationAddedCallbacks = new Map();
        this.onConversationUpdatedCallbacks = new Map();
        this.onConversationDeletedCallbacks = new Map();
        this.onMessageAddedCallbacks = new Map();
        this.onMessageUpdatedCallbacks = new Map();
        // this.onMessageAddedInConversationCallbacks = new Map();
        // this.onMessageUpdatedInConversationCallbacks = new Map();
        this.onGroupUpdatedCallbacks = new Map();

        this.callbackHandlers = new Map();
        // key: handler_id
        // value: {
        //     "type": "messageAddedInConversation",
        //     "conversWith": "ID",
        //     "callback": callback
        // }
        // key: conversWith
        // value: {
        //     "handler_id": true
        // }

        this.on_message_handler = null
        this.on_connect_handler = null
        this.connected = false
    }

    subscribeToMyConversations() { // MESSAGES ETC.
        // WILDCARS:
        // MQTT: https://www.hivemq.com/blog/mqtt-essentials-part-5-mqtt-topics-best-practices/
        // RABBITMQ: https://www.cloudamqp.com/blog/2015-09-03-part4-rabbitmq-for-beginners-exchanges-routing-keys-bindings.html#topic-exchange
        this.topic_inbox = 'apps/tilechat/users/' + this.user_id + "/#"
        console.log("subscribing to:", this.user_id, "topic", this.topic_inbox)
        this.client.subscribe(this.topic_inbox, (err)  => {
            console.log("subscribed to:", this.topic_inbox, " with err", err)
        })
    }

    // subscribeToMyMessages() {
    //     // this subscription because in /conversations I receive my messages
    //     // 'apps/tilechat/users/ME/messages/TO/outgoing'
    //     // 'apps/tilechat/users/ME/messages/FROM/incoming'
    //     let messages_inbox = 'apps/tilechat/users/' + this.user_id + '/messages/+'
    //     console.log("subscribing to inbox of:", this.user_id, "topic", messages_inbox)
    //     this.client.subscribe(messages_inbox, (err)  => {
    //         console.log("subscribed to:", messages_inbox, " with err", err)
    //     })
    // }

    sendMessage(text, type, recipient_id, recipient_fullname, sender_fullname, attributes, metadata, channel_type, callback) {
        // callback - function (err) 
        console.log("recipient_id:", recipient_id)
        let dest_topic = `apps/${this.appid}/users/${this.user_id}/messages/${recipient_id}/outgoing`
        console.log("dest_topic:", dest_topic)
        let outgoing_message = {
            text: text,
            type: type,
            recipient_fullname: recipient_fullname,
            sender_fullname: sender_fullname,
            attributes: attributes,
            metadata: metadata,
            channel_type: channel_type
        }
        outgoing_message = {...outgoing_message, ...attributes }
        const payload = JSON.stringify(outgoing_message)
        this.client.publish(dest_topic, payload, null, (err) => {
            callback(err, outgoing_message)
        })
    }

    updateMessageStatus(messageId, conversWith, status, callback) {
        // callback - function (err) 
        console.log("updating recipient_id:", messageId, "on conversWith", conversWith, "status", status)
        // 'apps/tilechat/users/USER_ID/messages/CONVERS_WITH/MESSAGE_ID/update'
        let dest_topic = `apps/${this.appid}/users/${this.user_id}/messages/${conversWith}/${messageId}/update`
        console.log("update dest_topic:", dest_topic)
        let message_patch = {
            status: status
        }
        const payload = JSON.stringify(message_patch)
        console.log("payload:", payload)
        this.client.publish(dest_topic, payload, null, (err) => {
            if (callback) {
                callback(err, message_patch)
            }
        })
    }

    updateConversationIsNew(conversWith, is_new, callback) {
        // callback - function (err) 
        console.log("updating conversation with:", conversWith, "is_new", is_new)
        // 'apps/tilechat/users/USER_ID/conversations/CONVERS_WITH/update'
        let dest_topic = `apps/${this.appid}/users/${this.user_id}/conversations/${conversWith}/update` //'apps/tilechat/users/' + this.user_id + '/conversations/' + conversWith + '/update'
        console.log("update dest_topic:", dest_topic)
        let patch = {
            is_new: is_new
        }
        const payload = JSON.stringify(patch)
        console.log("payload:", payload)
        this.client.publish(dest_topic, payload, null, (err) => {
            if (callback) {
                callback(err)
            }
        })
    }

    createGroup(name, group_id, members, callback) {
        // callback - function (err)
        console.log("creating group:", name, "id", group_id, "members", members)
        // who creates the group is also group-admin
        // ex.: http://localhost:8004/tilechat/04-ANDREASPONZIELLO/conversations
        const URL = `${this.APIendpoint}/${this.appid}/groups`
        console.log("creating group...", URL)
        let data = {
            group_name: name,
            group_id: group_id,
            group_members: members
        }
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("POST", URL, true);
        xmlhttp.setRequestHeader("authorization", this.jwt);
        xmlhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xmlhttp.onreadystatechange = function() {
            if (callback && xmlhttp.readyState == 4 && xmlhttp.status == 200 && xmlhttp.responseText) {
                try {
                    const json = JSON.parse(xmlhttp.responseText)
                    callback(null, json.result)
                }
                catch (err) {
                    console.log("parsing json ERROR", err)
                    callback(err, null)
                }
            }
        };
        xmlhttp.send(JSON.stringify(data));
    }

    archiveConversation(conversWith, callback) {
        // callback - function (err) 
        console.log("archiving conversation with:", conversWith)
        // 'apps/tilechat/users/USER_ID/conversations/CONVERS_WITH/archive'
        let dest_topic = 'apps/tilechat/users/' + this.user_id + '/conversations/' + conversWith + '/archive'
        console.log("archive dest_topic:", dest_topic)
        // let patch = {
        //     action: 'archive'
        // }
        const payload = JSON.stringify({})
        // console.log("payload:", payload)
        this.client.publish(dest_topic, payload, null, (err) => {
            if (callback) {
                callback(err)
            }
        })
    }

    // onMessage(callback) {
    //     this.last_handler++
    //     this.onMessageCallbacks.set(this.last_handler, callback)
    //     return this.last_handler;
    // }

    onConversationAdded(callback) {
        this.last_handler++
        this.onConversationAddedCallbacks.set(this.last_handler, callback)
        return this.last_handler;
    }

    onConversationUpdated(callback) {
        this.last_handler++
        this.onConversationUpdatedCallbacks.set(this.last_handler, callback)
        return this.last_handler;
    }

    onConversationDeleted(callback) {
        this.last_handler++
        this.onConversationDeletedCallbacks.set(this.last_handler, callback)
        return this.last_handler;
    }

    onMessageAdded(callback) {
        this.last_handler++
        this.onMessageAddedCallbacks.set(this.last_handler, callback)
        return this.last_handler;
    }

    onMessageAddedInConversation(conversWith, callback) {
        this.last_handler++
        const callback_obj = {
            "type": CALLBACK_TYPE_ON_MESSAGE_ADDED_FOR_CONVERSATION,
            "conversWith": conversWith,
            "callback": callback
        }
        this.callbackHandlers.set(this.last_handler, callback_obj)
        // TODO (for performance): addToMessageAddedInConversationCallbacks(conversWith, this.last_handler)

        // this.callbackHandlers = new Map();
        // key: handler_id
        // value: {
        //     "type": "messageAddedInConversation",
        //     "conversWith": "ID",
        //     "callback": callback
        // }
        return this.last_handler;
    }

    onMessageUpdatedInConversation(conversWith, callback) {
        this.last_handler++
        const callback_obj = {
            "type": CALLBACK_TYPE_ON_MESSAGE_UPDATED_FOR_CONVERSATION,
            "conversWith": conversWith,
            "callback": callback
        }
        this.callbackHandlers.set(this.last_handler, callback_obj)

        // this.last_handler++
        // callback_obj = {
        //     "conversWith": conversWith,
        //     "callback": callback
        // }
        // this.onMessageUpdatedCallbacks.set(this.last_handler, callback_obj)
        return this.last_handler;
    }

    onMessageUpdated(callback) {
        this.last_handler++
        this.onMessageUpdatedCallbacks.set(this.last_handler, callback)
        return this.last_handler;
    }

    onGroupUpdated(callback) {
        this.last_handler++
        this.onGroupUpdatedCallbacks.set(this.last_handler, callback)
        return this.last_handler;
    }

    // removeMessageHandler(handler) {
    //     this.onMessageCallbacks.delete(handler)
    // }

    start() {
        if (this.on_message_handler) {
            console.log("this.on_message_handler already subscribed. Reconnected num", this.reconnections)
            return
        }
        this.subscribeToMyConversations()
        // no more then one "on_message" handler, thanks.
        this.on_message_handler = this.client.on('message', (topic, message) => {
            console.log("topic:" + topic + "\nmessage payload:" + message)
            const _topic = this.parseTopic(topic)
            if (!_topic) {
                console.log("Invalid message topic:", topic);
                return;
            }
            const conversWith = _topic.conversWith
            try {
                const message_json = JSON.parse(message.toString())
                

                // TEMPORARILY DISABLED, CONVERSATIONS OBSERVED BY NEW MESSAGES.
                // MOVED TO: this.onMessageAddedCallbacks
                // if (this.onConversationAddedCallbacks) {
                //     if (topic.includes("/conversations/") && topic.endsWith(_CLIENTADDED)) {
                //         // map.forEach((value, key, map) =>)
                //         this.onConversationAddedCallbacks.forEach((callback, handler, map) => {
                //             callback(message_json, _topic)
                //         });
                //     }
                // }

                if (this.onConversationUpdatedCallbacks) {
                    if (topic.includes("/conversations/") && topic.endsWith(_CLIENTUPDATED)) {
                        // map.forEach((value, key, map) =>)
                        this.onConversationUpdatedCallbacks.forEach((callback, handler, map) => {
                            callback(message_json, _topic)
                        });
                    }
                }

                if (this.onConversationDeletedCallbacks) {
                    if (topic.includes("/conversations/") && topic.endsWith(_CLIENTDELETED)) {
                        // map.forEach((value, key, map) =>)
                        this.onConversationDeletedCallbacks.forEach((callback, handler, map) => {
                            callback(message_json, _topic)
                        });
                    }
                }

                if (this.onMessageAddedCallbacks) {
                    if (topic.includes("/messages/") && topic.endsWith(_CLIENTADDED)) {
                        this.onMessageAddedCallbacks.forEach((callback, handler, map) => {
                            callback(message_json, _topic)
                        });
                        // Observing conversations added from messages
                        console.log("Observing conversations added from messages", message_json);
                        if (this.onConversationAddedCallbacks) {
                            console.log("callbacks ok........");
                            let update_conversation = true;
                            if (message_json.attributes && message_json.attributes.updateconversation == false) {
                              update_conversation = false
                            }
                            console.log("update_conversation........", update_conversation);
                            if (update_conversation) {
                                this.onConversationAddedCallbacks.forEach((callback, handler, map) => {
                                    callback(message_json, _topic)
                                });
                            }
                        }
                    }
                }

                if (this.onMessageUpdatedCallbacks) {
                    if (topic.includes("/messages/") && topic.endsWith(_CLIENTUPDATED)) {
                        this.onMessageUpdatedCallbacks.forEach((callback, handler, map) => {
                            callback(message_json, _topic)
                        });
                    }
                }

                if (this.onGroupUpdatedCallbacks) {
                    if (topic.includes("/groups/") && topic.endsWith(_CLIENTUPDATED)) {
                        this.onGroupUpdatedCallbacks.forEach((callback, handler, map) => {
                            callback(message_json, _topic)
                        });
                    }
                }

                // // ******* NEW!!
                this.callbackHandlers.forEach((value, key, map) => {
                    const callback_obj = value
                    // callback_obj = {
                    //     "type": "onMessageUpdatedForConversation",
                    //     "conversWith": conversWith,
                    //     "callback": callback
                    // }
                    const type = callback_obj.type
                    if (topic.includes("/messages/") && topic.endsWith(_CLIENTADDED)) {
                        console.log("/messages/_CLIENTADDED")
                        if (type === CALLBACK_TYPE_ON_MESSAGE_ADDED_FOR_CONVERSATION) {
                            if (conversWith === callback_obj.conversWith) {
                                console.log("/messages/_CLIENTADDED on: ", conversWith)
                                callback_obj.callback(message_json, _topic)
                            }
                        }
                    }
                    if (topic.includes("/messages/") && topic.endsWith(_CLIENTUPDATED)) {
                        console.log("/messages/_CLIENTUPDATED")
                        if (type === CALLBACK_TYPE_ON_MESSAGE_UPDATED_FOR_CONVERSATION) {
                            if (conversWith === callback_obj.conversWith) {
                                console.log("/messages/_CLIENTUPDATED on: ", conversWith)
                                callback_obj.callback(message_json, _topic)
                            }
                        }
                    }
                })
                
                // if (topic.includes("/messages/") && topic.endsWith(_CLIENTUPDATED)) {
                //     this.onMessageUpdatedInConversationCallbacks.forEach((obj, handler, map) => {
                //         if (conversWith === obj.conversWith) {
                //             callback(message_json, _topic)
                //         }
                //     });
                // }
                

            }
            catch (err) {
                console.log("ERROR:", err)
            }
        })
        console.log("HANDLER_:", this.on_message_handler)
    }

    parseTopic(topic) {
        var topic_parts = topic.split("/")
        // /apps/tilechat/users/(ME)/messages/RECIPIENT_ID/ACTION
        if (topic_parts.length >= 7) {
            const app_id = topic_parts[1]
            const sender_id = topic_parts[3]
            const recipient_id = topic_parts[5]
            const convers_with = recipient_id
            const me = sender_id
            const parsed = {
                "conversWith": convers_with
            }
            return parsed
        }
        return null
    }

    lastArchivedConversations(callback) {
        // ex.: http://localhost:8004/tilechat/04-ANDREASPONZIELLO/archived_conversations
        const URL = `${this.APIendpoint}/${this.appid}/${this.user_id}/archived_conversations`
        console.log("getting last archived conversations...", URL)
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", URL, true);
        xmlhttp.setRequestHeader("authorization", this.jwt);
        xmlhttp.onreadystatechange = function() {
            // console.log("onreadystatechange!")
            if (callback && xmlhttp.readyState == 4 && xmlhttp.status == 200 && xmlhttp.responseText) {
                try {
                    const json = JSON.parse(xmlhttp.responseText)
                    callback(null, json.result)
                }
                catch (err) {
                    console.log("parsing json ERROR", err)
                    callback(err, null)
                }
            }
        };
        xmlhttp.send(null);
    }

    lastConversations(callback) {
        // ex.: http://localhost:8004/tilechat/04-ANDREASPONZIELLO/conversations
        const URL = `${this.APIendpoint}/${this.appid}/${this.user_id}/conversations`
        console.log("getting last convs...", URL)
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", URL, true);
        xmlhttp.setRequestHeader("authorization", this.jwt);
        xmlhttp.onreadystatechange = function() {
            // console.log("onreadystatechange!")
            if (callback && xmlhttp.readyState == 4 && xmlhttp.status == 200 && xmlhttp.responseText) {
                try {
                    const json = JSON.parse(xmlhttp.responseText)
                    callback(null, json.result)
                }
                catch (err) {
                    console.log("parsing json ERROR", err)
                    callback(err, null)
                }
            }
        };
        xmlhttp.send(null);
    }

    getGroup(group_id, callback) {
        // ex.: http://localhost:8004/tilechat/04-ANDREASPONZIELLO/conversations
        const URL = `${this.APIendpoint}/${this.appid}/groups/${group_id}`
        console.log("getting group...", URL)
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", URL, true);
        xmlhttp.setRequestHeader("authorization", this.jwt);
        xmlhttp.onreadystatechange = function() {
            if (callback && xmlhttp.readyState == 4 && xmlhttp.status == 200 && xmlhttp.responseText) {
                try {
                    const json = JSON.parse(xmlhttp.responseText)
                    callback(null, json.result)
                }
                catch (err) {
                    console.log("parsing json ERROR", err)
                    callback(err, null)
                }
            }
        };
        xmlhttp.send(null);
    }

    lastMessages(convers_with, callback) {
        // console.log("START: ", this.user_id)
        // ex.: http://localhost:8004/tilechat/04-ANDREASPONZIELLO/conversations
        const URL = this.APIendpoint + "/" + this.appid + "/" + this.user_id + "/conversations/" + convers_with + "/messages"
        // console.log("getting last messages", URL)
        // console.log("END")
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.open("GET", URL, true);
        xmlhttp.setRequestHeader("authorization", this.jwt);
        xmlhttp.onreadystatechange = function() {
            // console.log("onreadystatechange messages!")
            if (callback && xmlhttp.readyState == 4 && xmlhttp.status == 200 && xmlhttp.responseText) {
                // console.log("xmlhttp...", xmlhttp.responseText)
                try {
                    // console.log("parsing json messages")
                    const json = JSON.parse(xmlhttp.responseText)
                    callback(null, json.result)
                }
                catch (err) {
                    console.log("parsing json messages ERROR", err)
                    callback(err, null)
                }
            }
        };
        xmlhttp.send(null);
    }

    connect(user_id, jwt, callback) {
        this.user_id = user_id;
        // console.log("userid:", this.user_id)
        this.jwt = jwt
        console.log("connecting user_id:", user_id)
        console.log("using jwt token:", jwt)
        
        if (this.client) {
            this.client.end()
        }
        const presence_topic = 'apps/tilechat/users/' + this.user_id + '/presence/' + this.client_id
        let options = {
            keepalive: 10,
            // protocolId: 'MQTT',
            // protocolVersion: 4,
            // clean: true,
            reconnectPeriod: 1000,
            // connectTimeout: 30 * 1000,
            will: {
                topic: presence_topic,
                payload: '{"disconnected":true}',
                qos: 1,
                retain: true
            },
            username: 'JWT',
            password: jwt,
            rejectUnauthorized: false
        }
        console.log("starting mqtt connection with LWT on:", presence_topic, this.endpoint)
        // client = mqtt.connect('mqtt://127.0.0.1:15675/ws',options)
        this.client = mqtt.connect(this.endpoint,options)
        
        this.client.on('connect',
            () => {
                console.log("chat client connected...")
                if (!this.connected) {
                    console.log("chat client first connection.")
                    this.connected = true
                    this.start()
                    callback()
                }
            }
        );
    }
}