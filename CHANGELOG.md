# chat21-web-widget ver 2.0

### 3.0.19-beta.27
- new: send welcame message when open conversation

### 3.0.19-beta.25
- bug fixed: auto stop audio on last message recived

### 3.0.19-beta.24
- bug fixed: restoreTextArea (reset heigth text area on send message)

### 3.0.19-beta.23
- bug fixed: first scrollToBottom() 
- bug fixed: add animation scrollToBottom
- bug fixed: icon mic/pause 
- bug fixed: play/stop message on push

### 3.0.19-beta.22
- bug fixed: refactoring scrollToBottom()

### 3.0.19-beta.21
- bug fixed: scroll to bottom conversation when autoplay new message received

### 3.0.19-beta.20
- bug fixed: play stop on the last message received, by pressing the button mute
- bug fixed: play stop on the last message received on new recording
- bug fixed: no play last message received if is not new
- bug fixed: scroll to bottom conversation when refresh page with widget closed and after open conversation
- bug fixed: scroll to bottom when arrives new message and start position is top
- bug fixed: resizeInputField when recording new vocal message
- bug fixed: restoreTextArea after send vocal message

### 3.0.19-beta.19A
- bug fixed: onfocus message that moves view to the top

### 3.0.19-beta.19
- added button stop audio
- audio play auto on last msg
- hidden audio in the msg
- integrate startSpeechToText


### 3.0.19-beta.18G
- added button autoplay true/false

### 3.0.19-beta.18E
- bug fix heigt footer on onfocus

### 3.0.19-beta.18E
- set focus on the last message recived (for auto-reading)

### 3.0.19-beta.18D
- add check startFromHome testi.html
- hidden log.console
- call loadParams on loadParams in testi.html

### 3.0.19-beta.18
- window.tiledesk.showCallout() // open callout window if widget is closed
- delete rotatedState in card emoticon and changed emoticon


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
