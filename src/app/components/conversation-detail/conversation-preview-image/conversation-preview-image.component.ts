import { MAX_HEIGHT_TEXTAREA } from './../../../../chat21-core/utils/constants';
import { style } from '@angular/animations';
import { NativeImageRepoService } from './../../../../chat21-core/providers/native/native-image-repo';
import { Component, Input, OnInit, EventEmitter, Output, SimpleChange, ViewChild, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LoggerService } from '../../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../../chat21-core/providers/logger/loggerInstance';
import { MAX_WIDTH_IMAGES } from '../../../../chat21-core/utils/constants';

@Component({
  selector: 'chat-conversation-attachment-preview',
  templateUrl: './conversation-preview-image.component.html',
  styleUrls: ['./conversation-preview-image.component.scss']
})
export class ConversationPreviewImageComponent implements OnInit {
  @ViewChild('divPreview') public scrollMe: ElementRef;

  @Input() attachments: [{ file: Array<any>, metadata: {}}];
  @Input() translationMap: Map< string, string>;
  @Input() stylesMap: Map<string, string>;
  @Output() onSendAttachment = new EventEmitter<any>();
  @Output() onCloseModalPreview = new EventEmitter();

  public hideHeaderCloseButton: Boolean = false;
  public arrayFiles = [];
  public fileSelected: any;
  public file_extension: string;

  /**TEXT AREA PARAMETER */
  public textInputTextArea: string = '';
  public isFilePendingToLoad: boolean = false;
  public HEIGHT_DEFAULT = '20px';
  public currentHeight: number = 0;


  // ========= begin:: gestione scroll view messaggi ======= //
  startScroll = true; // indica lo stato dello scroll: true/false -> è in movimento/ è fermo
  idDivScroll = 'c21-contentScroll-preview'; // id div da scrollare
  isScrolling = false;
  isIE = /msie\s|trident\//i.test(window.navigator.userAgent);
  firstScroll = true;
  // ========= end:: gestione scroll view messaggi ======= //


  private logger: LoggerService = LoggerInstance.getInstance()
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.logger.log('[LOADER-PREVIEW-PAGE] Hello!');
    this.setFocusOnId('chat21-main-message-context-preview')
    // tslint:disable-next-line: prefer-for-of
    // this.selectedFiles = this.files;
    for (let i = 0; i < this.attachments.length; i++) {
      console.log('[LOADER-PREVIEW-PAGE] ngOnInit', this.attachments[i])
      this.readAsDataURL(this.attachments[i]); //GABBBBBBB
      //this.fileChange(this.files[i]);
    }
    
    
  }

  /**
   *
   * @param message
   */
  getMetadataSize(metadata): any {
    const MAX_WIDTH_IMAGES_PREVIEW = 200
    if(metadata.width === undefined){
      metadata.width= MAX_WIDTH_IMAGES_PREVIEW
    }
    if(metadata.height === undefined){
      metadata.height = MAX_WIDTH_IMAGES_PREVIEW
    }
    // const MAX_WIDTH_IMAGES = 300;
    
    const sizeImage = {
        width: metadata.width,
        height: metadata.height
    };
    //   that.g.wdLog(['message::: ', metadata);
    if (metadata.width && metadata.width > MAX_WIDTH_IMAGES_PREVIEW) {
        const rapporto = (metadata['width'] / metadata['height']);
        sizeImage.width = MAX_WIDTH_IMAGES_PREVIEW;
        sizeImage.height = MAX_WIDTH_IMAGES_PREVIEW / rapporto;
    }

    if(metadata.height && metadata.width > MAX_WIDTH_IMAGES_PREVIEW){
      const rapporto = (metadata['height'] / metadata['width']);
      sizeImage.width = MAX_WIDTH_IMAGES_PREVIEW / rapporto;
      sizeImage.height = MAX_WIDTH_IMAGES_PREVIEW ;
    }
    
    return sizeImage; // h.toString();
  }
  

  readAsDataURL(attachment: any) {
    const that = this;
    this.logger.log('[LOADER-PREVIEW-PAGE] readAsDataURL file', attachment);
    // ---------------------------------------------------------------------
    // USE CASE IMAGE
    // ---------------------------------------------------------------------
    // if (file.type.startsWith("image") && (!file.type.includes('svg'))) {

    //   this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE IMAGE file TYPE', file.type);
    //   const reader = new FileReader();
    //   reader.onloadend = (evt) => {
    //     const imageXLoad = new Image;
    //     this.logger.debug('[LOADER-PREVIEW-PAGE] onload ', imageXLoad);
    //     imageXLoad.src = reader.result.toString();
    //     imageXLoad.title = file.name;
    //     imageXLoad.onload = function () {
    //       // that.arrayFilesLoad.push(imageXLoad);
    //       const uid = (new Date().getTime()).toString(36); // imageXLoad.src.substring(imageXLoad.src.length - 16);
    //       const metadata = {
    //         'name': imageXLoad.title,
    //         'src': imageXLoad.src,
    //         'width': imageXLoad.width,
    //         'height': imageXLoad.height,
    //         'type': file.type,
    //         'uid': uid
    //       };

    //       that.logger.debug('[LOADER-PREVIEW-PAGE] OK: ', metadata);
    //       that.arrayFiles.push(metadata);
    //       if (!that.fileSelected) {
    //         that.fileSelected = metadata;
    //       }
    //     };
        
    //   };

    //   reader.readAsDataURL(file);
    //   // ---------------------------------------------------------------------
    //   // USE CASE SVG 
    //   // ---------------------------------------------------------------------
    // } else if (file.type.startsWith("image") && (file.type.includes('svg'))) {
    //   // this.previewFiles(file)

    //   this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL file TYPE', file.type);
    //   this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL file ', file);
    //   const preview = document.querySelector('#img-preview') as HTMLImageElement;


    //   const reader = new FileReader();
    //   const that = this;
    //   reader.addEventListener("load", function () {
    //     // convert image file to base64 string
    //     // const img = reader.result as string;
    //     const img = reader.result.toString();
    //     that.logger.log('FIREBASE-UPLOAD USE CASE SVG LoaderPreviewPage readAsDataURL img ', img);

    //     // that.fileSelected = that.sanitizer.bypassSecurityTrustResourceUrl(img);

    //     that.arrayFiles.push(that.sanitizer.bypassSecurityTrustResourceUrl(img));
    //     if (!that.fileSelected) {
    //       that.fileSelected = that.sanitizer.bypassSecurityTrustResourceUrl(img);
    //     }
    //   }, false);

    //   if (file) {
    //     reader.readAsDataURL(file);
    //   }

    //   // ---------------------------------------------------------------------
    //   // USE CASE FILE
    //   // ---------------------------------------------------------------------
    //   // } else if (file.type.startsWith("application") || file.type.startsWith("video") || file.type.startsWith("audio") ) {
    // } else {
    //   this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE ', file);
    //   this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE TYPE', file.type);
    //   // this.file_extension = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) || file.name;
    //   // this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE EXTENSION', this.file_extension);
    //   // this.file_name = file.name
    //   // this.file_name_ellipsis_the_middle = this.start_and_end(file.name)
    //   // this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE NAME', this.file_name);
    //   // if (file.type) {
    //   //   const file_type_array = file.type.split('/');
    //   //   this.logger.log('FIREBASE-UPLOAD USE CASE FILE LoaderPreviewPage readAsDataURL file_type_array', file_type_array);
    //   //   this.file_type = file_type_array[1]
    //   // } else {
    //   //   this.file_type = file.name.substring(file.name.lastIndexOf('.')+1, file.name.length) || file.name;

    //   // }
    //   this.createFile();
    // }
    if((attachment.file.type.startsWith("image")) && (!attachment.file.type.includes("svg"))){
      // ---------------------------------------------------------------------
      // USE CASE IMAGE
      // ---------------------------------------------------------------------
      this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE IMAGE - IMAGE ', attachment);
      if(!this.fileSelected){
        this.fileSelected = this.attachments[0]
      }
    } else if ((attachment.file.type.startsWith("image")) && (attachment.file.type.includes("svg"))){
      // ---------------------------------------------------------------------
      // USE CASE SVG
      // ---------------------------------------------------------------------
      this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE SVG - SVG ', attachment);
      attachment.metadata.src = this.sanitizer.bypassSecurityTrustUrl(attachment.metadata.src)
      if(!this.fileSelected){
        this.fileSelected = this.attachments[0]
      }
    }else if((!attachment.file.type.startsWith("image")) || (!attachment.file.type.includes('svg'))){
      // ---------------------------------------------------------------------
      // USE CASE FILE
      // ---------------------------------------------------------------------
      this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE ', attachment);
      this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE TYPE', attachment.file.type);
      this.file_extension = attachment.file.name.substring(attachment.file.name.lastIndexOf('.') + 1, attachment.file.name.length) || attachment.file.name;
      this.createFile(attachment);
    }
  }

  async createFile(attachment) {
    const that = this
    let response = await fetch('./assets/images/file-alt-solid.png');
    let data = await response.blob();
    let file_temp = new File([data], attachment.file.name);
    this.logger.log('[LOADER-PREVIEW-PAGE] - createFile file - file', file_temp);
    const reader = new FileReader();
    reader.onloadend = (evt) => {
      const imageXLoad = new Image;
      this.logger.debug('[LOADER-PREVIEW-PAGE] onload ', imageXLoad);
      imageXLoad.src = reader.result.toString();
      imageXLoad.title = attachment.file.name;
      imageXLoad.onload = function () {
        const metadata = {
          'name': imageXLoad.title,
          'src': that.sanitizer.bypassSecurityTrustUrl(imageXLoad.src),
          'width': 80,
          'height': 106,
          'type': attachment.metadata.type,
          'uid': attachment.metadata.uid
        };

        that.logger.debug('[LOADER-PREVIEW-PAGE] OK: ', metadata);
        that.arrayFiles.push({metadata});
        if (!that.fileSelected) {
          that.fileSelected = {metadata};
        }
      };
    }

    reader.readAsDataURL(file_temp);
  }


  /** -------- TEXT AREA METHODS: BEGIN ----------- */
  onTextAreaChange(){
    this.resizeInputField();
    this.resizeModalHeight()
    // this.setWritingMessages(this.textInputTextArea)
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

  resizeInputField() {
    try {
      const target = document.getElementById('chat21-main-message-context-preview') as HTMLInputElement;
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
      // this.onChangeTextArea.emit({textAreaEl: target, minHeightDefault: this.HEIGHT_DEFAULT})
    } catch (e) {
      this.logger.error('[LOADER-PREVIEW-PAGE] > Error :' + e);
    }
    // tslint:disable-next-line:max-line-length
    //   that.logger.debug('[CONV-FOOTER] H:: this.textInputTextArea', this.textInputTextArea, target.style.height, target.scrollHeight, target.offsetHeight, target.clientHeight);
  }


  resizeModalHeight(){
    try{
      const textarea = document.getElementById('chat21-main-message-context-preview') as HTMLInputElement;
      const height = +textarea.style.height.substring(0, textarea.style.height.length - 2);
      
      if(height > 20 && height < 110){
        this.scrollMe.nativeElement.style.height = 'calc(40% + ' + (height - 20)+'px'
        // document.getElementById('chat21-button-send-preview').style.right = '18px'
        // this.scrollToBottom()
      } else if(height <= 20) {
        this.scrollMe.nativeElement.style.height = '40%'
      } else if(height > 110){
        // document.getElementById('chat21-button-send-preview').style.right = '18px'
      }


    } catch (e) {
      this.logger.error('[LOADER-PREVIEW-PAGE] > Error :' + e);
    }
  }

  private restoreTextArea() {
    //   that.logger.debug('[CONV-FOOTER] AppComponent:restoreTextArea::restoreTextArea');
    this.resizeInputField();
    const textArea = (<HTMLInputElement>document.getElementById('chat21-main-message-context-preview'));
    this.textInputTextArea = ''; // clear the textarea
    if (textArea) {
      textArea.value = '';  // clear the textarea
      textArea.placeholder = this.translationMap.get('LABEL_PLACEHOLDER');  // restore the placholder
      this.logger.debug('[LOADER-PREVIEW-PAGE] AppComponent:restoreTextArea::restoreTextArea::textArea:', 'restored');
    } else {
      this.logger.error('[LOADER-PREVIEW-PAGE] restoreTextArea::textArea:', 'not restored');
    }
    this.setFocusOnId('chat21-main-message-context-preview');
  }

  /*
  * @param event
  */
  onkeypress(event) {
    const keyCode = event.which || event.keyCode;
    this.textInputTextArea = ((document.getElementById('chat21-main-message-context-preview') as HTMLInputElement).value);
    // this.logger.debug('[CONV-FOOTER] onkeypress **************', this.textInputTextArea, keyCode]);
    if (keyCode === 13) {
      if (this.textInputTextArea && this.textInputTextArea.trim() !== '') {
        //   that.logger.debug('[CONV-FOOTER] sendMessage -> ', this.textInputTextArea);
        // this.resizeInputField();
        // this.messagingService.sendMessage(msg, TYPE_MSG_TEXT);
        // this.setDepartment();
        // this.textInputTextArea = replaceBr(this.textInputTextArea);
        this.onSendAttachment.emit(this.textInputTextArea);
        this.restoreTextArea();
      }
    } else if (keyCode === 9) {
      // console.log('TAB pressedddd')
      event.preventDefault();
    }
  }

  onPaste(event){
    this.resizeInputField();
    this.logger.debug('[LOADER-PREVIEW] onPaste', event)
    
  }

  onClickClose(){
    this.logger.debug('[LOADER-PREVIEW] onCLose')
    this.onCloseModalPreview.emit()
  }

  onSendPressed(event){
    this.logger.debug('[LOADER-PREVIEW] onSendPressed', event)
    this.onSendAttachment.emit(this.textInputTextArea)
  }

  // =========== BEGIN: event emitter function ====== //
  onImageRenderedFN(event){
    this.isFilePendingToLoad = false
  }
  // =========== END: event emitter function ====== //
}
