# chat21-web-widget ver 5.0

### 5.0.23-rc.5
- added: user-typing while splitting a message
- bug-fixed: typing was showed also after message arrives
### 5.0.23-rc.4
- removed: double subscription from firebase typing events
- bug-fixed: attachment buttons showed in each command_message

### 5.0.23-rc.3
 - changed: loagind spinner when conversation start -> replaced with user-typing component
 - changed: base bounce color for user-typing component
 - added: user-typing component (only spinner) when bot type a message
 - bug-fixed: emojii was not catched when message came from chat
 
### 5.0.23-rc.2
- removed: avatar on left side of typing 
- bug-fixed: command uid for a split msg moved up
- bug-fixed: typing was active also when sender type a message
- bug-fixed: do not notify commands message on child_changed firebase event

### 5.0.23-rc.1
- added: mobileMarginX and mobileMarginY tiledesk settings property to manage mobile launch button margin
- added: typing component moved from con-header to conv-content
- bug-fixed: align-right and align-left were both set if align equals to 'right'
- bug-fixed: splitted message update unexisted firebase msg node
- removed: align-right and align-left css class from iframe-stype.css -> now they are managed by mobileMarginX and mobileMarginY parameters
- changed: moved emotion check in firebase-conversation service to converation-content component

### 5.0.22 IN PROD

### 5.0.22-rc.9
- bug-fixed: transform string value of customAttribute url parameter to keyValue object
- changed: last step 'close' button UI star-rating component
- changed: info-message font size reduced
- added: hideBubbleInfoMessage tiledesk propery to manage bubble info message

### 5.0.22-rc.8
- bug-fixed: preChatFormJson error when passed through tiledeskSettings 

### 5.0.22-rc.7
- changed: errorLabel and label translation key restored to old values

### 5.0.21.1 IN PROD
- bug-fixed: z-index increased
- bug-fixed: errorLabel not translated if translate key is passed

### 5.0.22-rc.6
- bug-fixed: z-index increased
- changed: label and errorLabel key value for preChatFormJson

### 5.0.22-rc.5
- added: 'name' key property to static preChatFormjson

### 5.0.22-rc.4
- bug-fixed: not show info message if it can't retrive translations
- bug-fixed: reduced space for single emoticon when user send message 

### 5.0.22-rc.3
- bug-fixed: new conversation button do not deactivate itself and show conversation-footer text area when nativeRating is activate and only 1 department is active

### 5.0.22-rc.2
- added: nativeRating management

### 5.0.22-rc.1
- added: enabled info message for MEMBER_JOINED_GROUP (not for bot, only human)
- added: new conversation button in conversation-footer if conversation is archived. user can start new conversation from this button directly

### 5.0.21 IN PROD
- bug-fixed: first bubble message  flikers when new conversation starts

### 5.0.20 IN PROD

### 5.0.19.2 IN PROD

### 5.0.20-rc.4
- bug-fixed: when message comes from mobile app, message wasn't rendered because msg.attributes not exist 

### 5.0.19.1 IN PROD

### 5.0.20-rc.3
- bug-fixed: undefined when sendRate in last step

### 5.0.20-rc.2
- bug-fixed: (mqtt) new conversation was signed as archived conversation beacause archivedConversationHandlers get conversation detail from active conversation node
- bug-fixed: buttonBackgrounColor and buttonHovertextColor was setted programatically based on themeColor
- bug-fied: sendMessage and sendSupportMessage external method provide more than 1 input parameter: now pass a MessageObj
- bug-fixed: space between lines was different if message contains emojii

### 5.0.20-rc.1
- bug-fixed: if widget is open on mobile browser, when user scroll on conversation messages, scrolls also parent hosting page --> added style to body page

### 5.0.19 IN PROD

### 5.0.19-rc.13
- bug-fixed: onBeforeInit was not called in launch function
- bug-fixed: link test inside bubble message not set text color dynamically
- added: setParmeter and setAttributeParameter methods added to external programmers

### 5.0.19-rc.12
- added: onBeforeInit tiledesk event
- added: checkImageExists function in image-repo.service
- changed: launch.js file -> replace onInit with onBeforeInit
- bug-fixed: window.Tiledesk function wasn't created if widget don't have any event queued
- bug-fixed: if tiledeskToken passed is different from stored one, remove item with key 'recipientId' in storage 

### 5.0.19-rc.11
- bug-fixed: widget sounds also when info message arrived: managed conversationChanged BS
- bug-fixed: if avatar image is not set, it delays in being shown the default placeholder image 
- bug-fixed: check if conversation.attributes has property subtype: 'info' before manageTabNotification
- bug-fixed: chatbot gif was grainly
- bug-fixed: do not show home component after department is selected -> show conversation component and then destroy select-department component
- bug-fixed: /file-alt-solid.png not found
- bug-fixed: getConversationDetail logic updates because if conversation is archived and widget tab is already closed, when user open it again, widget don't know the right status of the conversation and think always that is an active conversation
- bug-fixed: bubbleSentBackground and bubbleReceivedBackground errors while rgb color is passed as property value
- added: if previus message has same senderId, not show avatar and agent/bot placeholder
- added : subscription to on('value') firebase event in getConversationDetail method
- added: buttonBackgroundColor, buttonTextColor, buttonHoverBackgroundColor, buttonHoverTextColor tiledesk settings property to customize attachment buttons
- added: enabled splitting messages into different message objects
- added: loader in iframe bubblemessage component (WID-53)
- added: when user send/receive single emotion, it is showed without background and bigger than normal message text size
- updated: chat21client.js and mqtt-conversation-handler.ts
- changed: signInWithCustomToken and signInAnonymously function now return a Promise\<UserModel>
- changed: button to scroll conversation-content component now have background and fill color same as themeColor and foregroundColor on :hover event
- changed: show all-conversation option in home-conversation if exist at least one active or closed conversation

### 5.0.19-rc.10
- bug-fixed: widget sounds also when info message arrived: managed conversationChanged BS
- bug-fixed: if avatar image is not set, it delays in being shown the default placeholder image 
- bug-fixed: check if conversation.attributes has property subtype: 'info' before manageTabNotification
- bug-fixed: chatbot gif was grainly
- bug-fixed: do not show home component after department is selected -> show conversation component and then destroy select-department component
- bug-fixed: /file-alt-solid.png not found
- bug-fixed: getConversationDetail logic updates because if conversation is archived and widget tab is already closed, when user open it again, widget don't know the right status of the conversation and think always that is an active conversation
- bug-fixed: bubbleSentBackground and bubbleReceivedBackground errors while rgb color is passed as property value
- added: if previus message has same senderId, not show avatar and agent/bot placeholder
- added : subscription to on('value') firebase event in getConversationDetail method
- added: buttonBackgroundColor, buttonTextColor, buttonHoverBackgroundColor, buttonHoverTextColor tiledesk settings property to customize attachment buttons
- added: enabled splitting messages into different message objects
- added: loader in iframe bubblemessage component (WID-53)
- added: when user send/receive single emotion, it is showed without background and bigger than normal message text size
- updated: chat21client.js and mqtt-conversation-handler.ts
- changed: signInWithCustomToken and signInAnonymously function now return a Promise\<UserModel>
- changed: button to scroll conversation-content component now have background and fill color same as themeColor and foregroundColor on :hover event
- changed: show all-conversation option in home-conversation if exist at least one active or closed conversation

### 5.0.19-rc.9
- changed: button to scroll conversation-content component now have background and fill color same as themeColor and foregroundColor on :hover event
- added: info message component only when chat is closed (not visible yet)
- added: managed 'New Conversation' button on conversation footer when conversation is archived -> start new conversation workflow
- bug-fixed: image was resized with preview maximum dimensions and not with bubble-message maximum dimensions
- bug-fixed: chatbot gif was grainly
- bug-fixed: textAreaEl undefined 
- bug-fixed: if singleConversation and nativeRating is active, after rating is completed, go back to conversation detail
- bug-fixed: do not show home component after department is selected -> show conversation component and then destroy select-department component

### 5.0.19-rc.8
- changed: show all-conversation option in home-conversation if exist at least one active or closed conversation
- bug-fixed: mqtt is not definet in chat21client.js
- bug-fixed: /file-alt-solid.png not found 
- added: if singleConversation and nativeRating is active, after rating is completed, go back to conversation detail; if singleConversation is NOT active and nativeRating is active, after rating is completed, go to home component
- added: 'start new conversation' button in conversation-footer component if conversation is archived to have the possibility to start faster a new conversation
- added: not show footer if conversation is archived

### 5.0.19-rc.7
- added: nativeRating property to tiledesk settings to decide if show/hide rating component
- added : subscription to on('value') firebase event in getConversationDetail method
- updated: chat21client.js and mqtt-conversation-handler.ts
- bug-fixed: ratingWidget component not shown because getConversationDetail fired multiple times and change isConversationArchived boolean value
- bug-fixed: tiledesk_singleConversation property not get right value 

### 5.0.19-rc.6
- added: border to conversation-preview header
- added: singleConversation widget mode: if true and recipientId property IS NOT SET, widget loads the last active conversation by timestamp order; if true and recipientId property IS SET, widget loads current conversation 
- removed: 'px' to image component dimensions
- bug-fixed: getConversationDetail logic updates because if conversation is archived and widget tab is already closed, when user open it again, widget don't know the right status of the conversation and think always that is an active conversation

### 5.0.18.1 IN PROD 
- bug-fixed: property align not works when no one set it (WID-92)	
- bug-fixed: loading bounces not have same color of themeColor
- bug-fixed: bubbleSentBackground and bubbleReceivedBackground errors while rgb color is passed as property value (WID-86)	
- bug-fixed: disabled horizontal resize for form-textarea component
- changed: bubbleSentMessage gradiend from .5 to .8
- changed: bubbleMessage border radius from 8px to 20px
- added: management of keaboard tab button for preChatForm
- added: widgetVer attributes property 
- added: hideSettings tiledesk property to hide/show settings icon in home (WID-80)	

### 5.0.19-rc.5.1
- bug-fixed: cannot find module environments/firebase-config in firebase-conversations-handler

### 5.0.19-rc.5
- added: buttonBackgroundColor, buttonTextColor, buttonHoverBackgroundColor, buttonHoverTextColor tiledesk settings property to customize attachment buttons
- changed: bubblemessage ui when single emojii is in message text

### 5.0.19-rc.4
- bug-fixed: recipientId property from url was override by storage value (WID-87)
- added: loader in iframe bubblemessage component (WID-53)
- added: when user send/receive single emotion, it is showed without background and bigger than normal message text size

### 5.0.19-rc.3
- changed: border-radius bubble-message (same as buttons)
- added: enabled splitting messages into different message objects

### 5.0.19-rc.2
- bug-fixed: bubbleSentBackground and bubbleReceivedBackground errors while rgb color is passed as property value

### 5.0.19-rc.1
- added: if msg.type is 'html' enable possibility to render html code inside msg.text (WID-82)
- added: hideSettings tiledesk property to hide/show settings icon in home (WID-80)
- added: widgetVer attributes property in conversation (WID-79)
- removed: title tag from return-receipt svg icons
- removed: privacyField property from tiledesk settings and from components usage
- bug-fixed: disabled horizontal resize for form-textarea component
- bug-fixed: loading bounce don't have themeColor and foregroundColor right value as background and color css property (WID-84)

### 5.0.18 IN PROD

### 5.0.18-rc.13
- bug-fixed: action button not show animation on button clicked if multiple action button is in DOM but show animation in previous action button
- bug-fixed: when conversation menu-options is clicked, the focus is moved to footer and mobile keyboard opens
- added: control if form-text name contains 'email' to show relative keyboard 
- removed: chat-message-attachment component in last-message component due to incompatibility with conversation object
- changed: moved all info log to debug log expect for init and authenticated log event
- changed: box shadow of launcher-button

### 5.0.18-rc.12
- bug-fixed: if userFullname contains only one word, avatarPlaceholder function return null string
- bug-fixed: form label property changed from 'value' to 'label' to support multilanguage
- changed: action button attribute property changed from 'show_reply' to 'show_echo'

### 5.0.18-rc.11
- bug-fixed: form textarea label not showed
- bug-fixed: form textarea show error border also if regex is validated
- bug-fixed: default value of bubbleSentTextColor and bubbleReceivedTextColor
- bug fixed: blur radius of shadow in laucher button reduced

### 5.0.18-rc.10
- removed: border from widget
- added: box-shadow to widget components and launcher-button component
- added: programmatically set fontSize, fontColor & fontFamily to bubble message child components (buttons and text components)
- added: programmatically set bubble message background and foreground color with bubbleSentBackground, bubbleReceivedBackground, bubbleSentTextColor, bubbleSentTextColor
- added:  programatically set message attachment buttons font size with buttonFontSize
- added: linear gradient to bubble message background like conversation-header background
- added: bubbleSentBackground, bubbleMsgReceivedBackground, bubbleSentTextColor, bubbleSentTextColor, fontSize, fontFamily , buttonFontSize as tiledesk parameters
- added: invertColor function to programatically decide the text color (white or black) of message text based on background color
- changed: hideTextReply and typeMessagePlaceholder attributes message key property renamed
- changed: border radius of widget 
- bug-fixed: when HEX color is passed throw url or settings, getParameterByname return a boolean --> removed '#' and '|#|' from regex
- bug-fixed: errorLabel object changed for form textarea component

### 5.0.18-rc.9
- updated: star-rating-widget component UI
- added: conversation-preview component while loading an attachment or onPaste event on footer textarea

### 5.0.18-rc.8
- added: ability to insert a new line after the current position in the message text area by pressing the key combinations "ALT + ENTER", "CTRL + ENTER", "CMD + ENTER", "SHIFT + ENTER"
- updated: chat21-core lib
- updated: star-rating-widget component UI (in-progress)

### 5.0.18-rc.7
- bug-fixed: on image/file received, managed conversation-list last-message field
- bug-fixed: restored footer textarea if 'hideTextReply' changes
- bug-fixed: restored default preChatFormJson if error occurred while rendering a field
- bug-fixed: added loader while image msg is loaded (previously the loader was shown only in the case of a file type message)
- bug-fixed: bubble message now get same width of image/iframe - (WID-74)

### 5.0.18-rc.6
- bug-fixed: on hover in form-textarea border-bottom disappeared
- bug-fixed: footer textarea did not activate again if msg.attributes.hideTextReply return to become false or undefined
- changed: footer div css when hideTextReply is TRUE -> background color added
- added: footer textarea placeholder when hideTextReply is TRUE
- added: 'accept-language-parser' plugin to parse label and errorLabel for preChatForm
- added: userFullname and userEmail property using 'updateUserEmail' 'updateUserEmail' property in msg attributes on newMessageAdded

### 5.0.18-rc.5
- bug-fixed: if 'type' property in preChatFormJson not exist, field was not rendered
- changed: renamed 'description' with 'value' for preChatFormJson with type 'label'
- changed: set 'type' with 'static' value for preChatFormJson static fields
- added: 'value' property to type: static
- added: 'GO TO TEST PAGE' in index.html page only for users different from agents

### 5.0.18-rc.4
- changed: if 'label' property in preChatFormJson not exist, set 'name' property as its value
- changed: if 'name' property in preChatFormJson not exist, not render form field
- changed: if 'type' property in preChatFormJson not exist, set 'text' as default value
- changed: renamed 'label' with 'description' for preChatFormJson with type 'label'
- added: 'rows' property to preChatFormJson for type: 'textarea'
- bug-fixed: preChatFormJson was not shown if preChatFormCustomFieldsEnabled was true

### 5.0.18-rc.3
- bug-fixed: form error label was shown only on the first press of the submit button
- changed: 'errorLabel' property in preChatFormJson (now has the same structure of 'label' property)
- changed: 'type' property value in preChatFormJson from 'string' to 'text' for input text form field
- added: case insensitive to 'type' property in preChatFormJson

### 5.0.18-rc.2
- bug-fixed: timestamp not changed in list-conversations
- bug-fixed: waiting_time_reply not translate time with the same language of previous string
- bug-fixed: timestamp in list-conversations has not the correct widget language
- bug-fixed: onImageLoaded and onConversationLoaded were not called
- changed: replace msg text with 'sent an image' or 'sent an attachment' string for last_message_text property value
- changed: avatar conversations color
- added: custom preChatFormJson, preChatFormJson and preChatFormCustomFieldsEnabled properties from widget remote object - (WID-64)
- added: getPreChatFormJson() and setPreChatFormJson(form) as javascript method 
- added: validateRegex function to check for valid regex from preChatFormJson object

### 5.0.18-rc.1
- bug-fixed: userFullname passed from url not set correctly due to user info received after tiledesk auth response - (WID-68)
- removed: 2 unuseful log (app.component and localSessionStorage initialize)

### 5.0.17 - PROD

### 5.0.17-rc.5
- bug-fixed: while load widget test page, if change active tab, widget test page title flashes and show 1 conversation not read (also if all conversations are read) - (WID-63)
- bug-fixed: if widget is closed and receive an image, last-message component show 'Invalid date' as timestamp info message date ( WID-61)
- changed: onBeforeMessageSent and onAfterMessageSend events object 

### 5.0.17-rc.4
- bug-fixed: senderFullname and recipientFullname parameters in sendSupportMessage function was undefined
- bug-fixed: on new conversation started not saved recipientId in appStorage
- bug-fixed: on logged out, widget restart from last conversation opened (this occur because globals stores 'recipiedId' --> cleaned parameter)
- bug-fixed: if calloutTimer not set (default is -1), if use showCallout() method, emojii was not shown
- changed: onBeforeMessageSent event is emitted after calc recipientFullname

### 5.0.17-beta.1 - NATIVE-MQTT

### 5.0.17-rc.3 
- bug-fixed: endpoint parameter in mqtt.connect method in chat21clinet.js was hard-coded

### 5.0.17-rc.2 
- changed: loggerService accept string value as logLevel input parameter
- changed: LogLevel const in constant.ts to map string in number
- updated: env, README.md and env.sample to accept string for logLevel property
- changed: removed mqtt lib from package.json and used specific version in chat21client.js
- changed: upload mqtt.min.js lib locally from assets/js/mqtt folder 
- bug-fixed: iframe url is null -> changed metadata.url to metadata.src in if condition

### 5.0.17-rc.1 
- bug-fixed: if widget is opened in two or more tabs and i send a message, it sounds in other tabs--> do not sound if i send a message
- bug-fixed: onPaste if text exceeded the minHeight, move send-button to left to not overflow the text-area scrool bar
- bug-fixed: image was rendered above bubble message while loading it
- bug-fixed: onAuthStateChanged not fired after signInWithCustomToken
- removed: triggerOnLoggedOut - triggerOnLoggedIn, endMessageRender() method

### 5.0.16 - PROD

### 5.0.16-rc.2
- bug-fixed: when user open a reopened chat, starRatingComponent was shown
- bug-fixed: undefined conversation.uid in firebase-conversations-handler and firebase-archivedconversations-handler services
- bug-fixed: align, language and fullScreenMode settings options undefined in index-dev
- bug-fixed: hideAllWidget() methos is undefined fot index-dev.html page --> now used hideWidget()
- changed: set isLogEnable default value in customLogger (before was assigned in constractor section)
- added: clear button to events text area in index-dev.html page

### 5.0.16-rc.1
- changed: improved tiledesk script spaces

### 5.0.0-beta.3.15
- bug-fixed: archived conversation was removed when user viewed its detail for the first time
- added: paste event on conversation-footer only for image file type
- changed: new Tiledesk logo in poweredBy footer html code

### 5.0.0-beta.3.14
 - bug-fixed: badgeNumberConversation is 0
 - changed: remoteConfig of env.pre.ts to false

### 5.0.0-beta.3.13
- bug-fixed: same user after log out --> mqtt-auth not publish BSSignOut 
- added: isLogEnabled parameter from url/tiledeskSettings in customLogger 
- adeed: queue initilialization in index.html page
- changed: renamed hideConversationOptionsMenu tiledeskSetting with hideHeaderConversationOptionsMenu
- changed: method name of customLogger
- changed: refactoring log method in components and levels struct
- removed: startMessage, userPassword, isLogoutEnabled tiledesksettings properties
- removed: from app.config userEmail && userPassword auth method

### 5.0.0-beta.3.12 - NATIVE-MQTT
- updated: mqtt.min.js lib to 2.4.8
- updated: mqtt service classes

### 5.0.0-beta.3.11
- added: hideConversationOptionsMenu tiledeskSetting property to manage options menu in conversation header
- added: fileUploadAccept property in env to manage type of file attachment to upload in conversation-footer
- added: type property in conversation model
- changed: set themeColor for bounce in conversation-content while load data
- changed: set label loagind for bounce in conversation-content while load data
- bug-fixed: flashing of message when changes status--> removed slide-in-right and slide-in-left class style animation
- bug-fixed: custom baloonImage moved from div to img tag
- bug-fixed: text message in conversation-footer obscure the content if text is more than 1 line

### 5.0.0-beta.3.10
- added: logLevel tiledeskSetting property to manage log 
- added: enabled chance to open widget into a specific conv by url with tiledesk_recipientid
- changed: removed activeConversation json from storage and saved only uid with 'PREFIX_recipientId' key
- bug-fixed: window.Tiledesk.q undefined in launch.js

### 5.0.0-beta.3.9
- added: fade-in animation when open chat-internal-frame component for self action button
- added: title in chat-internal-frame header component
- bug-fixed: markdown rendering moved from sender to receiver --> added htmlEntitiesEncode pipe to chat-text component
- bug-fixed: chat-list-conversations last_message_text --> now not used innerHTML to render message in list
- added: LoggerService used in component (not conversationDetail component yet)
- added: async methods and events invocation of the Widget (call test-new.html) -> in progress 

### 5.0.0-beta.3.8
- bug-fix: logger is undefined while load image in firebase-upload service 

### 5.0.0-beta.3.7
- bug-fixed: tiledesk-container showed with short dimension for ms on refresh --> removed showWidget() from signInWithCustomToken()
- added: css for chat-department component in list on hover
- changed: print of logger in firebase services to better understand source log component/service

### 5.0.0-beta.3.6 - NATIVE-MQTT
- removed: WELCOME translate property --> only used in chat-menu-option
- updated: mqtt services
- bug-fixed: native upload service --> removed encodeUri when load image

### 5.0.0-beta.3.5
- bug-fix: mgs trimmed on sendMessage method when user send a message
- bug-fix: removed black color from components header and used 'colorGradient' from globals settings
- bug-fix: native-upload when load files tha contains white space in their name--> encodeUri fixed bug
- bug-fix: on signOut, authenticate the same user --> clean g.tiledeskToken
- bug-fix: on signOut, prechatForm not shown --> clan userFullname and userEmail from globals.attributes and globals.userFullname, globals.userEmail
- changed: now load svg file as a file, not as an image type
-removed: showWidgetNameInConversation from tiledeskSetting (used in chat-conversation-footer to set recipientFullname += '-' + widgetTitle)
- added: openExternalLinkButton tiledeskSettings property to manage self action link button from bot

### 5.0.0-beta.3.4
- added: soundEnabled, launcherWidth, launcherHeight, baloonImage, baloonShape tiledeskSettings property
- changed: behavior of footer while loading image/file --> not is ever active also while uploading
- added: fake bubble message while loading: NOT ACTIVE YET
- added: internal-frame component for self button url
- bug fixed: markdown behavior externalied from service classes

### 5.0.0-beta.3.3
- bug-fix: rating page not shown while archive mqtt conv
- bug-fix: last message shown on refresh for mqtt engine
- added. avatar-image, message-attachment components inside last-message component
 
### 5.0.0-beta.3.2
- bug-fix: eyeeye-catcher card called once
- added: skipInfoMessage parameter for MQTTConversationHanlderService
- added: placeholder while image loading
- added: native-image-repo Service

### 5.0.0-beta.3.1 - NATIVE-MQTT
- updated: MQTT and FIREBASE services classes
- added: visibilityChange method to manage title and sound
- removed: old implementation of sound
- bug fixed: wrong number of badge shown when widget is closed

### 5.0.0-beta.3.0 - FIREBASE 
- bug-fix: startWith of undefined in utils in chat21-core
- bug-fix: isInfo of undefined in utils-message in chat21-core

### 5.0.0-beta.2.9
- changed: enabled sound on New message and on conversationChanged
- changed: uuid is now without '-' 
- added: image icon if conv.type is image in list-conversations

### 5.0.0-beta.2.8
- bug-fix: customToken from url
- removed: headerDate from messageModel
- bug-fix: set userFullname e userEmail parameter on signInAnonymously
- bug-fix: set userFullname e userEmail parameter on prechatForm
- added: uploadService, native-UploadService, groupsHandlerService, appStorageService
- changed: uid for new conversation -> now is 'support-group-' + projectId + uuid()
- updated: MQTT and FIREBASE services classes
- removed: deleted sendMessage2 and references of AuthService2 

### 5.0.0-beta.2.7
- bug-fix: scrollToButtom function undefined on badgeScroollToBottom in conversation component
- bug-fix: attributes.payload undefined if customAttributes not valorized
- bug-fix: updateConversationBadge on conversationChanged
- bug-fix: icon sender as swg 


### 5.0.0-beta.2.6
- bug-fix: translation error with /assets/ pages (ex. Tiledesk visitor page)
- bug-fix: after archived a converversation when open new conversation always show rating component
- bug-fix: conversationBadge not show when refresh closed widget 
- bug-fix: prechat form shown always, not only the first time
- change: startFromHome behavior changed (now if closed, open new conversation or saved conversation from storage)

- add: new sendMessage2 with attributes at runtime


### 5.0.0-beta.2.5
- bug-fix: typing when open conversation-detail if last message was sent by agent
- bug-fix: if new message arrived in conversation-detail and scrollDiv is at the end -> update is_new conversation attributes
- bug-fix: merge local with remote translations
- change: if last message came from user, show 'YOU' label in list-conversations
- added: info-message component for attributes.subtype message of type 'info/support'

# chat21-web-widget ver 4.0

### 4.0.90
- bug-fix: save new conversation in local storage

### 4.0.89
- bug-fix: new message on startFromHome false only when chat is opened
- change: disabled soundMessage

### 4.0.88
- bug-fix: Cannot read property 'g' of undefined

### 4.0.87
- bug-fix: sound on new message

### 4.0.86
- bug-fix: css logo and favicon in assets/twp/index.html
- change: shown callout only the first time

### 4.0.85
- bug-fix: width balloon message received

### 4.0.84
- bug-fix: align widget left/right mobile/desktop

### 4.0.83
- bug-fix: markdown on send messages
- bug-fix: icon on url message
- bug-fix: css with markdown actived
- bug-fix: max-width iframe

### 4.0.82
- bug-fix: markdown on received messages

### 4.0.81
- new: added type message 'iframe'

### 4.0.80
- bug-fix: activeConversation undefined in local storage

### 4.0.79
- bug-fix: changed min-height buttons in message

### 4.0.78
- bug-fix: bug css align callout left
- bug-fix: bug css width line text on mobile device
- new: installed emoji-regex
- bug-fix: first character in the callout field
- change: show link button in all messages not only on the last one

### 4.0.77
- new: changed css of the message with a single emoticon
- new: open widget on the last conversation

### 4.0.76
- new: added target self, parent, blank in button message

### 4.0.75
- new: added emoticon as the first character in the callout field

### 4.0.74
- bug-fix: disabled auto zoom in input 'Text' - Safari on iPhone 
- change: enabled callout on mobile device

### 4.0.73
- bug-fix: resized image (sent in message) with attribute size

### 4.0.72
- new: send message on action button

### 4.0.71
- change: changed animation and css in link and action buttons
- change: changed widget logo logic (now: nologo or url image)

### 4.0.70
- new: added link and action buttons

### 4.0.69
- change: remoteConfig: true

### 4.0.68
- bug-fix: load remoteConfigUrl with HttpClient
- bug-fix: logo widget max width
- bug-fix: console.log

### 4.0.67
- bug-fix: load remoteConfigUrl
- bug-fix: avatar logo widget

### 4.0.66
- bug-fix: showAttachmentButton
- change: added baseurl to remoteConfigUrl

### 4.0.65
- bug-fix: logo widget

### 4.0.64
- changed: send event "201" on first auth

### 4.0.63
- bug-fix: badge conversations

### 4.0.62
- bug-fix: logo widget
- bug-fix: sound on new message

### 4.0.61
- bug-fix: typing not work

### 4.0.60
- change: added "event", "isLogged", "user_id" (in attributes) to triggerOnAuthStateChanged

### 4.0.59
- bug-fix: show widget in index.html

### 4.0.58
- new: added trigger onConversationUpdated

### 4.0.57
- new: added check isValid to conversation list
- change: changed notification sound
- bug-fix: changed message error (firebase config is not defined in firebase-config.json...)
- bug-fix: fixed error with startFromHome:false and notification new message
- bug-fix: fixed error link on "go to console"
- new: added trigger onMessageCreated

### 4.0.54
- bug-fix: log

### 4.0.51
- bug-fix: read remoteConfigUrl from widget-config

### 4.0.50
- new: added ipAddress in attributes

### 4.0.49
- bug-fix: show widget with startHidden true

### 4.0.48
- new: added startHidden

### 4.0.47
- new: added privacy policy

### 4.0.46A
- bug-fix: right alignment of the buttons

### 4.0.46
- bug-fix: test_widget_page responsive

### 4.0.45G
- bug-fix: close mobile tooltip 
- bug-fix: fixed error on tooltip configuration
- bug-fix: order buttons in message

### 4.0.45C
- bug-fix: customize css tooltip 

### 4.0.45B
- bug-fix: css - button big message 

### 4.0.45A
- new: added tooltip to message

### 4.0.45
- bug-fix: css - buttons aligned right in the message

### 4.0.44B
- bug-fix: placeholder and logo widget in hp and conversation

### 4.0.44A
- bug-fix: placeholder and logo widget in hp and conversation
- bug-fix: name widget

### 4.0.44
- change: renamed variable hideAttachButton in showAttachmentButton
- new: added showAllConversations parameter
- new: added placeholder and logo widget in hp and conversation

### 4.0.43B
- change: step 1 sanitized messages
- change: step 2 replaced \n in message
- change: step 3 added markdown (only messages received)
- bug fix: changed width image with message

### 4.0.43A
- add: sanitize the output HTML

### 4.0.43
- bug fix: add word-wrap: break-word; on .message

### 4.0.42E
- bug fix: br message

### 4.0.42D
- changed: removed markdown in list-conversation

### 4.0.42C
- bug fix: url color in list-conversation
- bug fix: max-height in list-conversation

### 4.0.42B
- bug fix: url in _blank

### 4.0.42A
- bug fix: check archived chats


### 4.0.42
- new: add splitMessageForKey for video in chat (al momento non utilizzata!)
- new: add markdown messages (https://github.com/markedjs/marked, https://www.jamiecockrill.com/2018-04-30-marked-directive/, https://markrabey.com/2019/05/31/angular-markdown-pipe/)
- new: lock the archived chats
- new: added tiledesk_persistence
- changed: start page detail conversation on end intro animation
- bug fix: disabled button header until intro animation is complete


### 4.0.41A
- changed: remove BUTTON_DOWNLOAD_TRANSCRIPT
- new: added ngx-markdown step 1

### 4.0.41
- changed: show message with image and text (step1)

### 4.0.40
- new: dokerize project

### 4.0.39
- changed: email and fullname saved in attribute parameters after signInWithCustomToken

### 4.0.38
- bug fix: shown/hide iframe;
- changed: removed variables in local storage

### 4.0.37
- bug fix: triggerOnAuthStateChanged on error;

### 4.0.36
- changed: triggerOnAuthStateChanged on logout;

### 4.0.35
- bug fix: triggerOnAuthStateChanged on reinit, logout and error.

### 4.0.34
- bug fix: startFromHome

### 4.0.33
- changed: handling errors in authenticate

### 4.0.32
- changed: customize obsLoggedUser step1

### 4.0.31
- check: autoStart: false; persistence: 'session'; startFromHome: false; preChatForm: true
- bug fix: triggerOnAuthStateChanged;

### 4.0.30
- bug fix: limit 5 agent avatars;
- bug fix: removed log;
- bug fix: css callout;
- bug fix: load logo in test_widget_page;

### 4.0.29
- bug fix: changed tiledeskScriptBaseLocation in launc.js;

### 4.0.28
- bug fix: conversation.image;

### 4.0.27
- bug fix: removed timeout animation;
- bug fix: profile image or placeholder;
- bug fix: animations msg into;
- bug fix: asyncInit in launc.js;
- bug fix: limit 5 agents;

### 4.0.26
- bug fix: removed console.log;
- bug fix: renamed error in console.log;
- bug fix: showSpinner changed in html page

### 4.0.25
- bug fix: removed console.log; css close callout; vieport TWP page; 

### 4.0.24
- changed: set firebase.auth.Auth.Persistence.NONE;

### 4.0.23
- bug fix: tiledesk token in local storage

### 4.0.22
- bug fix: timeout spinner

### 4.0.21
- bug fix: with autoStart == false not start the login 
- bug fix: save tiledesk token in global
- bug fix: hide the spinner when the first message arrives

### 4.0.20
- new: added signInWithCustomToken before createCustomToken
### 4.0.19
- bug fix: signInWithCustomToken

### 4.0.18
- changed: add spinner to new conversation

### 4.0.17
- bug fix: shemaVersion, firebaseToken, tiledesk Token in storage without projectid
- bug fix: rating_message
- bug fix: callout and new message

### 4.0.16
- new: resigninAnonymousAuthentication 

### 4.0.15
- bug fix: show message in callout if attributes subtype != info

### 4.0.14
- bug fix: logout
- bug fix: first login
- bug fix: event on back to hp

### 4.0.13
- bug fix: removed id_user in events
- bug fix: single notification sound

### 4.0.12
- bug fix: event on first message
- new: logout if shemaVersion is != 4 
- new: add events onAuthStateChanged and onLoggedIn


### 4.0.11
- new: added sendSupportMessage

### 4.0.10
- new: added trigger onBeforeDepartmentsFormRender
- bug fix: url in twp
- bug fix: add new message

### 4.0.9
- updated twp 

### 4.0.8
- renamed tiledesk_widget_project in twp

### 4.0.7
- new: added filter on departments

### 4.0.6
- bug-fix: enhanced moment support

### 4.0.5
- bug-fix: Detect user language in initI18n.

### 4.0.4
- new: added currentConversationComponent in global
- new: added onNewConversationComponentInit trigger. Now to enabled greetings features you must add these lines of code:

```
window.tileDeskAsyncInit = function() {              
    window.tiledesk.on('onNewConversationComponentInit', function(event_data) {
       window.tiledesk.angularcomponent.component.g.currentConversationComponent.setAvailableAgentsStatus();
    });
}
```


### 4.0.1
- new: typing conversation

### 4.0.0
- stable version

### 3.0.28
- new: adds the ability to send a hidden message to start the conversation

### 3.0.27
- new: window.tiledesk.showCallout()  // open callout window if widget is closed
- bug fix: deleted hexadecimal with transparency x IE for display the border of the widget 
- bug fix: deleted min height widget
- bug fix: widget fullscreen con bordi netti
- bug fix: added css .rowMsg; 
- bug fix: changed customAttributes in json
- bug fix: changed name variables to customAttributes
- bug fix: changed wellcome in welcome
- bug fix: restoreTextArea (reset heigth text area on send message)
- bug fix: first scrollToBottom() 
- bug fix: add animation scrollToBottom
- bug fix: refactoring scrollToBottom()

### 3.0.26
- new: added parameter 'departmentID' 

### 3.0.25
- bug fix: translate

### 3.0.24
- bug fix: setupMyPresence on logout/login
- bug fix: css border 0 on iframe

### 3.0.22
- bug fix: custom auth in launch.js (function commented)

### 3.0.21
- bug fix:  c21-text-welcome change font 3.0em
- new: updated changelog

### 3.0.20
- bug fix:  c21-text-welcome change font 3.0em
- new: changed options icon
- new: changed animation fade-in-dw-up
- new: animation in  hp only on open widget
- new: added border to the widget
- new: added  uid attribute on each message
- new: removed shadow of the iframe
- bug fix: moved launcher button on iframe bottom 
- bug fix: changed z-index menu options.
- bug fix: launch.js on IE
- new: changed css on IE scrollbar, css buttons, css z-index, focus textarea
- bug fix: add attachment unique id on ConversationComponent
- bug fix: changed animation speed
- bug fix:  '"' in json in customAttributes
- new: add  variable customAttributes
- new: add  variable hideAttachButton
- bug fix: edges in full screen view 
- new: set image 'bot custom'  from js on trigger getImageUrlThumb
- bug fix:  bug on checkWritingMessages
- new: added animations on widget

### 3.0.19
- bug fix: css overflow: scroll  in bar of  the widget and callout (IE, Firefox-windows)
- bug fix: init not work in launch.js (IE)
- bug fix: triggers not work when the widget is in an iframe

# chat21-web-widget ver 2.0
### 1.020
- Add function reInit() widget
- Fixes bug 'undefined' on localstorage
- Fixes bug refresh list conversations
- Add Attachment in Attribute msg (buttons)
- Add setAttributeParameter
- Change url loading service variables from the server (without Auth)
- Fixes bug scroll to bottom messages with attachment

### 1.019
- Load variables from server by projectId
- Fixes bug clear localstorage

### 1.018
- Changes profile icons
- Fixes bug conversation badge

### 1.017
- Changes css of rating component

### 1.016
- Renames all keys of elements in sessionStorage ("projectId_"+key)
- Fixes bug hideHeaderCloseButton in detail conversation

### 1.015
- Fixes bug requester_id in attributes

### 1.014
- Fixes bug conversation.attributes

### 1.012
- Fixes bug show all conversations with only archived conversations 

### 1.011
- Fixes bug css rating 

### 1.010
- Fixes bug load image profile 
- limit number agents to 5
- change css ballon agent
- close callout on openwidget
- add external params showWaitTime, showAvailableAgents, showLogoutOption;

### 1.009
- Fixes align default to right

### 1.008
- resolved conflicts of normalize.scss
- resolved conflicts css generic
- adds CHANGELOG.md
