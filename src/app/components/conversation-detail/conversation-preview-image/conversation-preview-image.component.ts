import { Component, Input, OnInit, EventEmitter, Output, SimpleChange } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LoggerService } from '../../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../../chat21-core/providers/logger/loggerInstance';
import { MAX_WIDTH_IMAGES } from '../../../../chat21-core/utils/constants';

@Component({
  selector: 'chat-conversation-preview-image',
  templateUrl: './conversation-preview-image.component.html',
  styleUrls: ['./conversation-preview-image.component.scss']
})
export class ConversationPreviewImageComponent implements OnInit {

  @Input() files: [any];
  @Input() translationMap: Map< string, string>;
  @Input() stylesMap: Map<string, string>;
  @Output() onSendAttachment = new EventEmitter<any>();
  @Output() onCloseModalPreview = new EventEmitter();

  public hideHeaderCloseButton: Boolean = false;
  public arrayFiles = [];
  public fileSelected: any;
  private selectedFiles: any;

  private logger: LoggerService = LoggerInstance.getInstance()
  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.logger.log('[LOADER-PREVIEW-PAGE] Hello!');
    // tslint:disable-next-line: prefer-for-of
    this.selectedFiles = this.files;
    for (let i = 0; i < this.files.length; i++) {
      console.log('[CONV-PREVIEW] ngOnInit', this.files[i])
      this.readAsDataURL(this.files[i]);
      //this.fileChange(this.files[i]);
    }
  }

  ngOnChanges(changes: SimpleChange){
    console.log('[CONV-PREVIEW] ngOnChanges', this.files)
  }

  /**
   *
   * @param message
   */
  getMetadataSize(metadata): any {
    if(metadata.width === undefined){
      metadata.width= MAX_WIDTH_IMAGES
    }
    if(metadata.height === undefined){
      metadata.height = MAX_WIDTH_IMAGES
    }
    // const MAX_WIDTH_IMAGES = 300;
    const sizeImage = {
        width: metadata.width,
        height: metadata.height
    };
    //   that.g.wdLog(['message::: ', metadata);
    if (metadata.width && metadata.width > MAX_WIDTH_IMAGES) {
        const rapporto = (metadata['width'] / metadata['height']);
        sizeImage.width = MAX_WIDTH_IMAGES;
        sizeImage.height = MAX_WIDTH_IMAGES / rapporto;
    }
    return sizeImage; // h.toString();
  }
  

  readAsDataURL(file: any) {
    this.logger.log('[LOADER-PREVIEW-PAGE] readAsDataURL file', file);
    // ---------------------------------------------------------------------
    // USE CASE IMAGE
    // ---------------------------------------------------------------------
    if (file.type.startsWith("image") && (!file.type.includes('svg'))) {

      this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE IMAGE file TYPE', file.type);
      const reader = new FileReader();
      reader.onloadend = (evt) => {
        const img = reader.result.toString();
        this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - FileReader success ', img);
        this.arrayFiles.push(img);
        if (!this.fileSelected) {
          this.fileSelected = {src: img};
        }
      };

      reader.readAsDataURL(file);
      // ---------------------------------------------------------------------
      // USE CASE SVG 
      // ---------------------------------------------------------------------
    } else if (file.type.startsWith("image") && (file.type.includes('svg'))) {
      // this.previewFiles(file)

      this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL file TYPE', file.type);
      this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL file ', file);
      const preview = document.querySelector('#img-preview') as HTMLImageElement;


      const reader = new FileReader();
      const that = this;
      reader.addEventListener("load", function () {
        // convert image file to base64 string
        // const img = reader.result as string;
        const img = reader.result.toString();
        that.logger.log('FIREBASE-UPLOAD USE CASE SVG LoaderPreviewPage readAsDataURL img ', img);

        // that.fileSelected = that.sanitizer.bypassSecurityTrustResourceUrl(img);

        that.arrayFiles.push(that.sanitizer.bypassSecurityTrustResourceUrl(img));
        if (!that.fileSelected) {
          that.fileSelected = that.sanitizer.bypassSecurityTrustResourceUrl(img);
        }
      }, false);

      if (file) {

        reader.readAsDataURL(file);
      }

      // ---------------------------------------------------------------------
      // USE CASE FILE
      // ---------------------------------------------------------------------
      // } else if (file.type.startsWith("application") || file.type.startsWith("video") || file.type.startsWith("audio") ) {
    } else {
      this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE ', file);
      this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE TYPE', file.type);
      // this.file_extension = file.name.substring(file.name.lastIndexOf('.') + 1, file.name.length) || file.name;
      // this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE EXTENSION', this.file_extension);
      // this.file_name = file.name
      // this.file_name_ellipsis_the_middle = this.start_and_end(file.name)
      // this.logger.log('[LOADER-PREVIEW-PAGE] - readAsDataURL - USE CASE FILE - FILE NAME', this.file_name);
      // if (file.type) {
      //   const file_type_array = file.type.split('/');
      //   this.logger.log('FIREBASE-UPLOAD USE CASE FILE LoaderPreviewPage readAsDataURL file_type_array', file_type_array);
      //   this.file_type = file_type_array[1]
      // } else {
      //   this.file_type = file.name.substring(file.name.lastIndexOf('.')+1, file.name.length) || file.name;

      // }
      this.createFile();
    }
  }

  async createFile() {
    let response = await fetch('./assets/images/file-alt-solid.png');
    let data = await response.blob();
    let metadata = {
      type: 'image/png'
    };
    let file = new File([data], "test.png", metadata);
    this.logger.log('[LOADER-PREVIEW-PAGE] - createFile file - file', file);
    const reader = new FileReader();
    reader.onloadend = (evt) => {
      const img = reader.result.toString();
      this.logger.log('[LOADER-PREVIEW-PAGE] - createFile file - FileReader success img', img);
      this.arrayFiles.push(img);
      if (!this.fileSelected) {
        this.fileSelected = img;
      }
    };
    reader.readAsDataURL(file);
  }


  onClickClose(){
    this.logger.debug('[LOADER-PREVIEW] onCLose')
    this.onCloseModalPreview.emit()
  }

  onSendPressed(text: string){
    this.logger.debug('[LOADER-PREVIEW] onSendPressed')
    this.onSendAttachment.emit(text)
  }

}
