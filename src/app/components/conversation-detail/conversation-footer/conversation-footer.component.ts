import { ConversationModel } from './../../../../models/conversation';
import { ChatManager } from './../../../../chat21-core/providers/chat-manager';
import { ConversationHandlerService } from '../../../../chat21-core/providers/abstract/conversation-handler.service';
import { MessagingService } from './../../../providers/messaging.service';
import { TypingService } from '../../../../chat21-core/providers/abstract/typing.service';
import { TYPE_MSG_TEXT, TYPE_MSG_IMAGE, TYPE_MSG_FILE } from './../../../../chat21-core/utils/constants';
import { Globals } from './../../../utils/globals';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChange, SimpleChanges, OnChanges, ViewChild } from '@angular/core';
import { UploadModel } from '../../../../chat21-core/models/upload';
import { convertColorToRGBA, htmlEntities, replaceEndOfLine } from '../../../../chat21-core/utils/utils';
import { FileDetector } from 'protractor';
import { UploadService } from '../../../../chat21-core/providers/abstract/upload.service';
import { LoggerService } from '../../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../../chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'chat-conversation-footer',
  templateUrl: './conversation-footer.component.html',
  styleUrls: ['./conversation-footer.component.scss']
})
export class ConversationFooterComponent implements OnInit, OnChanges {

  @Input() conversationWith: string;
  @Input() attributes: string;
  @Input() senderId: string;
  @Input() tenant: string;
  @Input() projectid: string;
  @Input() channelType: string;
  @Input() userFullname: string;
  @Input() userEmail: string;
  @Input() widgetTitle: string;
  @Input() showAttachmentButton: boolean;
  // @Input() showWidgetNameInConversation: boolean
  @Input() isConversationArchived: boolean;
  @Input() hideTextReply: boolean;
  @Input() footerMessagePlaceholder: string;
  @Input() fileUploadAccept: string;
  @Input() stylesMap: Map<string, string>
  @Input() translationMap: Map< string, string>;
  @Output() onBeforeMessageSent = new EventEmitter();
  @Output() onAfterSendMessage = new EventEmitter();
  @Output() onChangeTextArea = new EventEmitter<any>();
  @Output() onAttachmentButtonClicked = new EventEmitter<any>();

  @ViewChild('chat21_file') public chat21_file: ElementRef;

  // ========= begin:: send image ======= //
  selectedFiles: FileList;
  isFilePendingToUpload: Boolean = false;
  arrayFilesLoad: Array<any> = [];
  isFileSelected: Boolean = false;
  HEIGHT_DEFAULT = '20px';
  // ========= end:: send image ========= //

  // isNewConversation = true;
  textInputTextArea: string;
  conversationHandlerService: ConversationHandlerService

  convertColorToRGBA = convertColorToRGBA;
  private logger: LoggerService = LoggerInstance.getInstance()
  constructor(public g: Globals,
              //public upSvc: UploadService,
              private chatManager: ChatManager,
              private typingService: TypingService,
              private uploadService: UploadService) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges){
    if(changes['conversationWith'] && changes['conversationWith'].currentValue !== undefined){
      this.conversationHandlerService = this.chatManager.getConversationHandlerByConversationId(this.conversationWith);
    }
    if(changes['hideTextReply'] && changes['hideTextReply'].currentValue !== undefined){
      this.restoreTextArea()
    }
  }
  
  ngAfterViewInit() {
    this.logger.debug('[CONV-FOOTER] --------ngAfterViewInit: conversation-footer-------- '); 
  }

  // ========= begin:: functions send image ======= //
  // START LOAD IMAGE //
  /**
   * carico in locale l'immagine selezionata e apro pop up anteprima
   */
  detectFiles(event) {
    this.logger.debug('[CONV-FOOTER] detectFiles: ', event);

    if (event) {
        this.selectedFiles = event.target.files;
        this.logger.debug('[CONV-FOOTER] AppComponent:detectFiles::selectedFiles', this.selectedFiles);
        // this.onAttachmentButtonClicked.emit(this.selectedFiles)
        if (this.selectedFiles == null) {
          this.isFilePendingToUpload = false;
        } else {
          this.isFilePendingToUpload = true;
        }
        this.logger.debug('[CONV-FOOTER] AppComponent:detectFiles::selectedFiles::isFilePendingToUpload', this.isFilePendingToUpload);
        this.logger.debug('[CONV-FOOTER] fileChange: ', event.target.files);
        if (event.target.files.length <= 0) {
          this.isFilePendingToUpload = false;
        } else {
          this.isFilePendingToUpload = true;
        }
        
        const that = this;
        if (event.target.files && event.target.files[0]) {
            const nameFile = event.target.files[0].name;
            const typeFile = event.target.files[0].type;
            const reader = new FileReader();
              that.logger.debug('[CONV-FOOTER] OK preload: ', nameFile, typeFile, reader);
              reader.addEventListener('load', function () {
                that.logger.debug('[CONV-FOOTER] addEventListener load', reader.result);
                that.isFileSelected = true;
                // se inizia con image
                if (typeFile.startsWith('image') && !typeFile.includes('svg')) {
                  const imageXLoad = new Image;
                  that.logger.debug('[CONV-FOOTER] onload ', imageXLoad);
                  imageXLoad.src = reader.result.toString();
                  imageXLoad.title = nameFile;
                  imageXLoad.onload = function () {
                    that.logger.debug('[CONV-FOOTER] onload immagine');
                    // that.arrayFilesLoad.push(imageXLoad);
                    const uid = (new Date().getTime()).toString(36); // imageXLoad.src.substring(imageXLoad.src.length - 16);
                    that.arrayFilesLoad[0] = { uid: uid, file: imageXLoad, type: typeFile };
                    that.logger.debug('[CONV-FOOTER] OK: ', that.arrayFilesLoad[0]);
                    // INVIO MESSAGGIO
                    that.loadFile();
                  };
                } else {
                  that.logger.debug('[CONV-FOOTER] onload file');
                  const fileXLoad = {
                    src: reader.result.toString(),
                    title: nameFile
                  };
                  // that.arrayFilesLoad.push(imageXLoad);
                  const uid = (new Date().getTime()).toString(36); // imageXLoad.src.substring(imageXLoad.src.length - 16);
                  that.arrayFilesLoad[0] = { uid: uid, file: fileXLoad, type: typeFile };
                  that.logger.debug('[CONV-FOOTER] OK: ', that.arrayFilesLoad[0]);
                  // INVIO MESSAGGIO
                  that.loadFile();
                }
              }, false);

              if (event.target.files[0]) {
                reader.readAsDataURL(event.target.files[0]);
                that.logger.debug('[CONV-FOOTER] reader-result: ', event.target.files[0]);
              }
        }
    }
  }


  loadFile() {
    this.logger.debug('[CONV-FOOTER] that.fileXLoad: ', this.arrayFilesLoad);
        // al momento gestisco solo il caricamento di un'immagine alla volta
        if (this.arrayFilesLoad[0] && this.arrayFilesLoad[0].file) {
            const fileXLoad = this.arrayFilesLoad[0].file;
            const uid = this.arrayFilesLoad[0].uid;
            const type = this.arrayFilesLoad[0].type;
            this.logger.debug('[CONV-FOOTER] that.fileXLoad: ', type);
            let metadata;
            if (type.startsWith('image') && !type.includes('svg')) {
                metadata = {
                    'name': fileXLoad.title,
                    'src': fileXLoad.src,
                    'width': fileXLoad.width,
                    'height': fileXLoad.height,
                    'type': type,
                    'uid': uid
                };
            } else {
                metadata = {
                    'name': fileXLoad.title,
                    'src': fileXLoad.src,
                    'type': type,
                    'uid': uid
                };
            }
            this.logger.debug('[CONV-FOOTER] metadata -------> ', metadata);
            // this.scrollToBottom();
            // 1 - aggiungo messaggio localmente
            // this.addLocalMessageImage(metadata);
            // 2 - carico immagine
            const file = this.selectedFiles.item(0);
            this.onAttachmentButtonClicked.emit({attachments: [{metadata, file}], message: this.textInputTextArea}) //GABBBBBBBB
            this.restoreTextArea();
            this.chat21_file.nativeElement.value = ''; //BUG-FIXED: allow you to re-load the same previous file
            // this.uploadSingle(metadata, file); 
            // this.isSelected = false;
        }
    }


  /**
   *
   */
    uploadSingle(metadata, file, messageText?: string) {
        const that = this;
        const send_order_btn = <HTMLInputElement>document.getElementById('chat21-start-upload-doc');
        send_order_btn.disabled = true;
        that.logger.debug('[CONV-FOOTER] AppComponent::uploadSingle::', metadata, file);
        // const file = this.selectedFiles.item(0);
        const currentUpload = new UploadModel(file);
        // console.log(currentUpload.file);

        // const uploadTask = this.upSvc.pushUpload(currentUpload);
        // uploadTask.then(snapshot => {
        //     return snapshot.ref.getDownloadURL();   // Will return a promise with the download link
        // }).then(downloadURL => {
        //     that.logger.debug('[CONV-FOOTER] AppComponent::uploadSingle:: downloadURL', downloadURL]);
        //     that.g.wdLog([`Successfully uploaded file and got download link - ${downloadURL}`]);

        //     metadata.src = downloadURL;
        //     let type_message = TYPE_MSG_TEXT;
        //     let message = 'File: ' + metadata.src;
        //     if (metadata.type.startsWith('image')) {
        //         type_message = TYPE_MSG_IMAGE;
        //         message = ''; // 'Image: ' + metadata.src;
        //     }
        //     that.sendMessage(message, type_message, metadata);
        //     that.isFilePendingToUpload = false;
        //     // return downloadURL;
        // }).catch(error => {
        //   // Use to signal error if something goes wrong.
        //   console.error(`AppComponent::uploadSingle:: Failed to upload file and get link - ${error}`);
        // });
      // this.resetLoadImage();
      

        this.uploadService.upload(this.senderId, currentUpload).then(downloadURL => {
          that.logger.debug('[CONV-FOOTER] AppComponent::uploadSingle:: downloadURL', downloadURL);
          that.logger.debug(`[CONV-FOOTER] Successfully uploaded file and got download link - ${downloadURL}`);

          metadata.src = downloadURL;
          let type_message = TYPE_MSG_TEXT;
          // let message = 'File: ' + metadata.src;
          let message = `[${metadata.name}](${metadata.src})`
          if (metadata.type.startsWith('image') && !metadata.type.includes('svg')) {
              type_message = TYPE_MSG_IMAGE;
              // message = '';
              message = messageText 
          } else if ((metadata.type.startsWith('image') && metadata.type.includes('svg')) || !metadata.type.startsWith('image')){
              type_message = TYPE_MSG_FILE
              // type_message = metadata.type
              message = message + '\n' + messageText
          } else if (!metadata.type.startsWith('image')){
            type_message = TYPE_MSG_FILE
            // type_message = metadata.type
            message = message + '\n' + messageText
          }
          that.sendMessage(message, type_message, metadata);
          that.chat21_file.nativeElement.value = ''; //BUG-FIXED: allow you to re-load the same previous file
          that.isFilePendingToUpload = false;
          // return downloadURL;
        }).catch(error => {
          // Use to signal error if something goes wrong.
          that.logger.error(`[CONV-FOOTER] uploadSingle:: Failed to upload file and get link - ${error}`);
          that.isFilePendingToUpload = false;
        });
        that.logger.debug('[CONV-FOOTER] reader-result: ', file);
    }

  /**
   * invio del messaggio
   * @param msg
   * @param type
   * @param metadata
   * @param additional_attributes
   */
  sendMessage(msg: string, type: string, metadata?: any, additional_attributes?: any) { // sponziello
    (metadata) ? metadata = metadata : metadata = '';
    this.logger.debug('[CONV-FOOTER] SEND MESSAGE: ', msg, type, metadata, additional_attributes);
    if (msg && msg.trim() !== '' || type === TYPE_MSG_IMAGE || type === TYPE_MSG_FILE ) {

      // msg = htmlEntities(msg);
      // msg = replaceEndOfLine(msg);
      // msg = msg.trim();

        let recipientFullname = this.translationMap.get('GUEST_LABEL');
          // sponziello: adds ADDITIONAL ATTRIBUTES TO THE MESSAGE
        const g_attributes = this.attributes;
        // added <any> to resolve the Error occurred during the npm installation: Property 'userFullname' does not exist on type '{}'
        const attributes = <any>{};
        if (g_attributes) {
          for (const [key, value] of Object.entries(g_attributes)) {
            attributes[key] = value;
          }
        }
        if (additional_attributes) {
          for (const [key, value] of Object.entries(additional_attributes)) {
            attributes[key] = value;
          }
        }
          // fine-sponziello
        // console.log('this.conversationswith', this.conversationWith)
        // this.conversationHandlerService = this.chatManager.getConversationHandlerByConversationId(this.conversationWith)
        const senderId = this.senderId;
        const projectid = this.projectid;
        const channelType = this.channelType;
        const userFullname = this.userFullname;
        const userEmail = this.userEmail;
        // const showWidgetNameInConversation = this.showWidgetNameInConversation;
        const widgetTitle = this.widgetTitle;
        const conversationWith = this.conversationWith;
        
        // this.triggerBeforeSendMessageEvent(
        //   recipientFullname,
        //   msg,
        //   type,
        //   metadata,
        //   conversationWith,
        //   recipientFullname,
        //   attributes,
        //   projectid,
        //   channelType
        // );
        if (userFullname) {
          recipientFullname = userFullname;
        } else if (userEmail) {
          recipientFullname = userEmail;
        } else if (attributes && attributes['userFullname']) {
          recipientFullname = attributes['userFullname'];
        } else {
          recipientFullname = this.translationMap.get('GUEST_LABEL');
        }
        // if (showWidgetNameInConversation && showWidgetNameInConversation === true) {
        //   recipientFullname += ' - ' + widgetTitle;
        // }

        this.onBeforeMessageSent.emit({
          senderFullname: recipientFullname,
          text: msg,
          type: type,
          metadata: metadata,
          conversationWith: conversationWith,
          recipientFullname: recipientFullname,
          attributes : attributes,
          projectid: projectid,
          channelType: channelType
        })
        
        const messageSent = this.conversationHandlerService.sendMessage(
          msg,
          type,
          metadata,
          conversationWith,
          recipientFullname,
          senderId,
          recipientFullname,
          channelType ,    
          attributes
        );

        // this.triggerAfterSendMessageEvent(messageSent);
        this.onAfterSendMessage.emit(messageSent)
        // this.isNewConversation = false;

        //TODO-GAB: da rivedere
        try {
          const target = document.getElementById('chat21-main-message-context') as HTMLInputElement;
          target.value = '';
          target.style.height = this.HEIGHT_DEFAULT;
          // console.log('target.style.height: ', target.style.height);
        } catch (e) {
          this.logger.error('[CONV-FOOTER] > Error :' + e);
        }
        this.restoreTextArea();
    }
  }

  //MOVED TO TRIGGERHANDLER
  // private triggerBeforeSendMessageEvent(senderFullname, text, type, metadata, conversationWith, recipientFullname, attributes, projectid, channel_type) {
  //   try {
  //       // tslint:disable-next-line:max-line-length
  //       const onBeforeMessageSend = new CustomEvent('onBeforeMessageSend', { detail: { senderFullname: senderFullname, text: text, type: type, metadata, conversationWith: conversationWith, recipientFullname: recipientFullname, attributes: attributes, projectid: projectid, channelType: channel_type } });
  //       const windowContext = this.g.windowContext;
  //       if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
  //           windowContext.tiledesk.tiledeskroot.dispatchEvent(onBeforeMessageSend);
  //           this.g.windowContext = windowContext;
  //       } else {
  //         this.el.nativeElement.dispatchEvent(onBeforeMessageSend);
  //       }
  //   } catch (e) {
  //     this.logger.debug('[CONV-FOOTER] > Error :' + e]);
  //   }
  // }

  //MOVED TO TRIGGERHANDLER
  // private triggerAfterSendMessageEvent(message) {
  //   try {
  //       // tslint:disable-next-line:max-line-length
  //       const onAfterMessageSend = new CustomEvent('onAfterMessageSend', { detail: { message: message } });
  //       const windowContext = this.g.windowContext;
  //       if (windowContext.tiledesk && windowContext.tiledesk.tiledeskroot) {
  //           windowContext.tiledesk.tiledeskroot.dispatchEvent(onAfterMessageSend);
  //           this.g.windowContext = windowContext;
  //       } else {
  //         this.el.nativeElement.dispatchEvent(onAfterMessageSend);
  //       }
  //   } catch (e) {
  //     this.logger.debug('[CONV-FOOTER] > Error :' + e]);
  //   }
  // }


  private restoreTextArea() {
    //   that.logger.debug('[CONV-FOOTER] AppComponent:restoreTextArea::restoreTextArea');
    this.resizeInputField();
    const textArea = (<HTMLInputElement>document.getElementById('chat21-main-message-context'));
    this.textInputTextArea = ''; // clear the textarea
    if (textArea) {
      textArea.value = '';  // clear the textarea
      textArea.placeholder = this.translationMap.get('LABEL_PLACEHOLDER');  // restore the placholder
      this.logger.debug('[CONV-FOOTER] AppComponent:restoreTextArea::restoreTextArea::textArea:', 'restored');
    } else {
      this.logger.error('[CONV-FOOTER] restoreTextArea::textArea:', 'not restored');
    }
    this.setFocusOnId('chat21-main-message-context');
  }

  /**
   * ridimensiona la textarea
   * chiamato ogni volta che cambia il contenuto della textarea
   * imposto stato 'typing'
   */
  resizeInputField() {
    try {
      const target = document.getElementById('chat21-main-message-context') as HTMLInputElement;
      // tslint:disable-next-line:max-line-length
      //   that.logger.debug('[CONV-FOOTER] H:: this.textInputTextArea', (document.getElementById('chat21-main-message-context') as HTMLInputElement).value , target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
      target.style.height = '100%';
      if (target.value === '\n') {
          target.value = '';
          target.style.height = this.HEIGHT_DEFAULT;
      } else if (target.scrollHeight > target.offsetHeight) {
          target.style.height = target.scrollHeight + 2 + 'px';
          target.style.minHeight = this.HEIGHT_DEFAULT;
      } else {
          //   that.logger.debug('[CONV-FOOTER] PASSO 3');
          target.style.height = this.HEIGHT_DEFAULT;
          // segno sto scrivendo
          // target.offsetHeight - 15 + 'px';
      }
      //this.setWritingMessages(target.value);
      this.onChangeTextArea.emit({textAreaEl: target, minHeightDefault: this.HEIGHT_DEFAULT})
    } catch (e) {
      this.logger.error('[CONV-FOOTER] > Error :' + e);
    }
    // tslint:disable-next-line:max-line-length
    //   that.logger.debug('[CONV-FOOTER] H:: this.textInputTextArea', this.textInputTextArea, target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
  }

  onTextAreaChange(){
    this.resizeInputField()
    this.setWritingMessages(this.textInputTextArea)
  }

  onSendPressed(event) {
    this.logger.debug('[CONV-FOOTER] onSendPressed:event', event);
    this.logger.debug('[CONV-FOOTER] AppComponent::onSendPressed::isFilePendingToUpload:', this.isFilePendingToUpload);
    if (this.isFilePendingToUpload) {
      this.logger.debug('[CONV-FOOTER] AppComponent::onSendPressed', 'is a file');
      // its a file
      this.loadFile();
      this.isFilePendingToUpload = false;
      // disabilito pulsanti
      this.logger.debug('[CONV-FOOTER] AppComponent::onSendPressed::isFilePendingToUpload:', this.isFilePendingToUpload);
    } else {
      if ( this.textInputTextArea && this.textInputTextArea.length > 0 ) {
        this.logger.debug('[CONV-FOOTER] AppComponent::onSendPressed', 'is a message');
        // its a message
        if (this.textInputTextArea.trim() !== '') {
          //   that.logger.debug('[CONV-FOOTER] sendMessage -> ', this.textInputTextArea);
          // this.resizeInputField();
          // this.messagingService.sendMessage(msg, TYPE_MSG_TEXT);
          // this.setDepartment();
          // this.textInputTextArea = replaceBr(this.textInputTextArea);
          this.sendMessage(this.textInputTextArea, TYPE_MSG_TEXT);
          // this.restoreTextArea();
        }
        // restore the text area
        // this.restoreTextArea();
      }
    }
  }





  setFocusOnId(id) {
    setTimeout(function () {
        const textarea = document.getElementById(id);
        if (textarea) {
            //   that.logger.debug('[CONV-FOOTER] 1--------> FOCUSSSSSS : ', textarea);
            textarea.setAttribute('value', ' ');
            textarea.focus();
        }
    }, 500);
  }

  removeFocusOnId(id){
    const textarea = document.getElementById(id);
    if (textarea) {
        textarea.blur()
    }
  }

  /**
   *
   * @param str
   */
  setWritingMessages(str) {
    //this.messagingService.setWritingMessages(str, this.g.channelType);
    this.typingService.setTyping(this.conversationWith, str, this.senderId, this.getUserFUllName() )
  }

  getUserFUllName(): string {
    const userFullName = this.userFullname
    if(userFullName){
      return userFullName
    }else{
      return this.translationMap.get('GUEST_LABEL')
    }
  }

  /**
   * quando premo un tasto richiamo questo metodo che:
   * verifica se è stato premuto 'invio'
   * se si azzera testo
   * imposta altezza campo come min di default
   * leva il focus e lo reimposta dopo pochi attimi
   * (questa è una toppa per mantenere il focus e eliminare il br dell'invio!!!)
   * invio messaggio
   * @param event
   */
  onkeypress(event) {
    const keyCode = event.which || event.keyCode;
    // console.log('keycode', keyCode)
    this.textInputTextArea = ((document.getElementById('chat21-main-message-context') as HTMLInputElement).value);
    // this.logger.debug('[CONV-FOOTER] onkeypress **************', this.textInputTextArea, keyCode]);
    if (keyCode === 13) {
      if (this.textInputTextArea && this.textInputTextArea.trim() !== '') {
        //   that.logger.debug('[CONV-FOOTER] sendMessage -> ', this.textInputTextArea);
        // this.resizeInputField();
        // this.messagingService.sendMessage(msg, TYPE_MSG_TEXT);
        // this.setDepartment();
        // this.textInputTextArea = replaceBr(this.textInputTextArea);
        this.sendMessage(this.textInputTextArea, TYPE_MSG_TEXT);
        // this.restoreTextArea();
      }
    } else if (keyCode === 9) {
      // console.log('TAB pressedddd')
      event.preventDefault();
    }
  }

  /*
  HANDLE: cmd+enter, shiftKey+enter, alt+enter, ctrl+enter
  */
  onkeydown(event){
    const keyCode = event.which || event.keyCode;
    // metaKey -> COMMAND ,  shiftKey -> SHIFT, altKey -> ALT, ctrlKey -> CONTROL
    if( (event.metaKey || event.shiftKey || event.altKey || event.ctrlKey) && keyCode===13){   
      event.preventDefault();
      this.textInputTextArea += '\r\n';
      this.resizeInputField();
    }
  }
  
  onPaste(event){
    this.resizeInputField()
    const items = (event.clipboardData || event.originalEvent.clipboardData).items;
    let file = null;
    this.logger.debug('[CONV-FOOTER] onPaste items ', items);
    for (const item of items) {
      this.logger.debug('[CONV-FOOTER] onPaste item ', item);
      this.logger.debug('[CONV-FOOTER] onPaste item.type ', item.type);
      if (item.type.startsWith("image")) {
        // SEND TEXT MESSAGE IF EXIST
        // if(this.textInputTextArea){
        //   this.logger.debug('[CONV-FOOTER] onPaste texttt ', this.textInputTextArea);
        //   this.sendMessage(this.textInputTextArea, TYPE_MSG_TEXT)
        // }

        try {
          this.restoreTextArea();
        } catch(e) {
          this.logger.error('[CONV-FOOTER] onPaste - error while restoring textArea:',e)
        }
        
        this.logger.debug('[CONV-FOOTER] onPaste item.type', item.type);
        file = item.getAsFile();
        const data = {target: new ClipboardEvent('').clipboardData || new DataTransfer()};
        data.target.items.add(new File([file], file.name, { type: file.type }));
        this.logger.debug('[CONV-FOOTER] onPaste data', data);
        this.logger.debug('[CONV-FOOTER] onPaste file ', file);
        this.detectFiles(data)
      }
    }
  }

}