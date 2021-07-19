import { Component, EventEmitter, Input, IterableChangeRecord, IterableChanges, IterableDiffers, KeyValueDiffers, OnInit, Output, SimpleChanges } from '@angular/core';
import { ConversationModel } from '../../../chat21-core/models/conversation';
import {
  getUrlImgProfile,
  setColorFromString,
  avatarPlaceholder,
  convertMessage} from '../../utils/utils';
import { ImageRepoService } from '../../../chat21-core/providers/abstract/image-repo.service';
import { LoggerService } from '../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'chat-list-conversations',
  templateUrl: './list-conversations.component.html',
  styleUrls: ['./list-conversations.component.scss']
})
export class ListConversationsComponent implements OnInit {

  // ========= begin:: Input/Output values ============//
  @Input() listConversations: Array<ConversationModel>;
  @Input() limit?: number
  @Input() stylesMap: Map<string, string>;
  @Input() translationMap: Map< string, string>;
  @Output() onConversationSelected = new EventEmitter<ConversationModel>();
  @Output() onImageLoaded = new EventEmitter<ConversationModel>();
  @Output() onConversationLoaded = new EventEmitter<ConversationModel>();
  // ========= end:: Input/Output values ============//

  // ========= begin:: dichiarazione funzioni ======= //
  convertMessage = convertMessage;
  setColorFromString = setColorFromString;
  avatarPlaceholder = avatarPlaceholder;
  getUrlImgProfile = getUrlImgProfile;
  // ========= end:: dichiarazione funzioni ========= //

  iterableDifferListConv: any;
  private logger: LoggerService = LoggerInstance.getInstance();

  empDifferMap: Map<string, any> = new Map<string, any>();
  empMap = new Map<string, ConversationModel>();
  arrayDiffer: any;

  constructor(private iterableDiffers: IterableDiffers,
              private kvDiffers: KeyValueDiffers) {
      this.iterableDifferListConv = this.iterableDiffers.find([]).create(null);
      
    }

  ngOnInit() {
    this.logger.debug('[LISTCONVERSATIONS] ngOnInit', this.listConversations);
     let convs: ConversationModel[] = this.listConversations
    // console.log('empDifferMap::' + JSON.stringify(this.listConversations))
    // this.listConversations.forEach(emp => {
    //   this.empDifferMap[emp.uid] = this.kvDiffers.find(emp).create();
    //   this.empMap[emp.uid] = emp;
    //   console.log('empDifferMap::', this.empDifferMap, this.empMap)
    // })
  }

  ngOnChanges(changes: SimpleChanges){
    // console.log('empDifferMap:: 1111' + JSON.stringify(this.listConversations[1]))
    // console.log('empDifferMap:: 1111', this.listConversations)
    // this.listConversations.forEach(emp => {
    //   this.empDifferMap[emp.uid] = this.kvDiffers.find(emp).create();
    //   this.empMap[emp.uid] = emp;
    //   console.log('empDifferMap::', this.empDifferMap, this.empMap)
    // })
  }

  public openConversationByID(conversation) {
    this.logger.debug('[LISTCONVERSATIONS] openConversationByID: ', conversation);
    if ( conversation ) {
      // this.conversationsService.updateIsNew(conversation);
      // this.conversationsService.updateConversationBadge();
      this.onConversationSelected.emit(conversation);
    }
  }

  ngAfterViewInit() {
    this.logger.debug('[LISTCONVERSATIONS] ---ngAfterViewInit---: listConversations ', this.listConversations);
  }

  ngDoCheck() {
    let changesListConversation = this.iterableDifferListConv.diff(this.listConversations);
    if(changesListConversation){
      // changesListConversation.forEachAddedItem(element => {
      //   let conv = element.item
      //   this.onImageLoaded.emit(conv)
      //   this.onConversationLoaded.emit(conv)
      // });
      // changesListConversation.forEachRemovedItem(element => {
      // });
      // changesListConversation.forEachOperation((element: IterableChangeRecord<ConversationModel>, adjustedPreviousIndex: number, currentIndex: number) => {
      //     // if (item.previousIndex == null) {
      //     //   console.log('itemmmm 1111', item, adjustedPreviousIndex)
      //     // } else if (currentIndex == null) {
      //     //   console.log('itemmmm 2222', item, adjustedPreviousIndex)
      //     // } else {
      //     //   console.log('itemmmm 3333', item, adjustedPreviousIndex)
      //     // }
      //     if(element.currentIndex == null || element.previousIndex == null){
      //       console.log('itemmmm 44444', element, adjustedPreviousIndex, currentIndex)
      //       let conv = element.item
      //       this.onImageLoaded.emit(conv)
      //       this.onConversationLoaded.emit(conv)
      //     }
      // });
      // changesListConversation.forEachItem((item: IterableChangeRecord<ConversationModel>)=> {
      //   console.log('itemmmm forEachItem', item)
      // });

    }


    //Detect changes in object inside array
    // for (let [key, empDiffer] of this.objDiffers) {
    //   let empChanges = empDiffer.diff(this.differ.get(key));
    //   if (empChanges) {
    //     empChanges.forEachChangedItem(record => {
    //       console.log('--- Employee with id ' + key + ' updated ---');
    //       // this.changeLogs.push('--- Employee with id ' + key + ' updated ---');
    //       console.log('Previous value: ' + record.previousValue);
    //       // this.changeLogs.push('Previous value: ' + record.previousValue);
    //       console.log('Current value: ' + record.currentValue);
    //       // this.changeLogs.push('Current value: ' + record.currentValue);
    //     });
    //   }
    // }
    
  }


}
