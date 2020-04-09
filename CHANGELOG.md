# chat21-web-widget ver 3.0

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
