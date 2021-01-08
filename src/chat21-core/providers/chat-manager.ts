
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
// import 'rxjs/add/operator/map';

// models
import { UserModel } from '../models/user';

// handlers
// import { ChatConversationHandler } from './chat-conversation-handler';
// import { ChatConversationsHandler } from './chat-conversations-handler';

import { ConversationHandlerService } from './abstract/conversation-handler.service';
import { ConversationsHandlerService } from './abstract/conversations-handler.service';
// import { ChatArchivedConversationsHandler } from './chat-archived-conversations-handler';
// import { ChatContactsSynchronizer } from './chat-contacts-synchronizer';
import { environment } from '../../environments/environment';
import { ArchivedConversationsHandlerService } from './abstract/archivedconversations-handler.service';


// @Injectable({ providedIn: 'root' })
@Injectable()
export class ChatManager {

  BSStart: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  supportMode = environment.supportMode;
  tenant = environment.tenant;

  private currentUser: UserModel;
  private tiledeskToken: string;

  private handlers: ConversationHandlerService[];
  // public archivedConversationsHandler: ChatArchivedConversationsHandler;
  // public contactsSynchronizer: ChatContactsSynchronizer;
  public openInfoConversation: boolean;

  constructor(
    // public chatContactsSynchronizer: ChatContactsSynchronizer,
    public conversationsHandlerService: ConversationsHandlerService,
    public archivedConversationsService: ArchivedConversationsHandlerService
  ) { }
  /**
   * inizializza chatmanager
   */
  initialize() {
    this.handlers = [];
    this.openInfoConversation = true;
    this.currentUser = null;
    console.log('************* init chat manager ***', this.handlers);
  }

  /**
   * setTiledeskToken
   */
  public setTiledeskToken(tiledeskToken: string) {
    this.tiledeskToken = tiledeskToken;
  }

  /**
   * return tiledeskToken
   */
  public getTiledeskToken(): string {
    console.log('this.tiledeskToken: ', this.tiledeskToken );
    return this.tiledeskToken;
  }

  /**
   * setCurrentUser
   */
  public setCurrentUser(currentUser: UserModel) {
    this.currentUser = currentUser;
  }

  /**
   * return current user detail
   */
  public getCurrentUser(): UserModel {
    console.log('currentUser: ', this.currentUser );
    return this.currentUser;
  }

  public startApp() {
    this.BSStart.next(this.currentUser);
  }
  /**
   *
   */
  getOpenInfoConversation(): boolean {
    return this.openInfoConversation;
  }
  /**
   * dispose all references
   * dispose refereces messaggi di ogni conversazione
   * dispose reference conversazioni
   * dispose reference sincronizzazione contatti
   */
  dispose() {
    console.log(' 1 - setOffAllReferences');
    if (this.handlers) { this.setOffAllReferences(); }
    console.log(' 2 - disposeConversationsHandler');
    if (this.conversationsHandlerService) { this.disposeConversationsHandler(); }
    console.log(' 3 - disposeArchivedConversationsHandler');
    // if (this.archivedConversationsHandler) { this.disposeConversationsHandler(); }
    console.log(' 4 - disposeContactsSynchronizer');
    // if (this.contactsSynchronizer) { this.disposeContactsSynchronizer(); }
    console.log(' OKK ');
    this.conversationsHandlerService = null;
    // this.contactsSynchronizer = null;
  }

  /**
   * invocato da user.ts al LOGIN:
   * LOGIN:
   * 1 - imposto lo stato di connessione utente
   * 2 - aggiungo il token
   * 3 - pubblico stato loggedUser come login
   */
  // goOnLine(user) {
  //   if (user) {
  //     const uid = user.uid;
  //     this.loggedUser = new UserModel(uid);
  //     console.log('goOnLine::: ', this.loggedUser);
  //     this.loadCurrentUserDetail();
  //     if (this.supportMode === false) {
  //       //this.initContactsSynchronizer();
  //     }
  //   }
  // }


  

  /** */
  // loadCurrentUserDetail() {
  //   const that = this;
  //   this.userService.loadCurrentUserDetail()
  //   .then((snapshot: any) => {
  //     if (snapshot.val()) {
  //       console.log('loadCurrentUserDetail::: ', snapshot.val());
  //       that.completeProfile(snapshot.val());
  //       that.events.publish('loaded-current-user', snapshot.val());
  //     }
  //   })
  //   .catch((err: Error) => {
  //     console.log('Unable to get permission to notify.', err);
  //   });
  // }

  /**
   * invocato da user.ts al LOGOUT:
   * 1 - cancello tutte le references
   * 2 - pubblico stato loggedUser come logout
   */
  goOffLine() {
    this.currentUser = null;
    // cancello token e user dal localstorage!!!!!
    console.log(' 1 - CANCELLO TUTTE LE REFERENCES DI FIREBASE');
    this.dispose();
  }

  /// START metodi gestione messaggi conversazione ////
  /**
   * aggiungo la conversazione all'array delle conversazioni
   * chiamato dall'inizialize di dettaglio-conversazione.ts
   * @param handler
   */
  addConversationHandler(handler: ConversationHandlerService) {
    console.log('CHAT MANAGER -----> addConversationHandler', this.handlers, handler);
    this.handlers.push(handler);
  }

  /**
   * rimuovo dall'array degli handlers delle conversazioni una conversazione
   * al momento non è utilizzato!!!
   * @param conversationId
   */
  removeConversationHandler(conversationId) {
    console.log(' -----> removeConversationHandler: ', conversationId);
    const index = this.handlers.findIndex(i => i.conversationWith === conversationId);
    this.handlers.splice(index, 1);
  }

  /**
   * cerco e ritorno una conversazione dall'array delle conversazioni
   * con conversationId coincidente con conversationId passato
   * chiamato dall'inizialize di dettaglio-conversazione.ts
   * @param conversationId
   */
  getConversationHandlerByConversationId(conversationId): any {
    let handler = null;
    this.handlers.forEach(conv => {
      // console.log('forEach ***', conversationId, this.handlers, conv);
      if (conv.conversationWith === conversationId) {
        handler = conv;
        return;
      }
    });
    return handler;
    // const resultArray = this.handlers.filter((handler) => {
    //   console.log('FILTRO::: ***', conversationId, handler.conversationWith);
    //   return handler.conversationWith === conversationId;
    // });

   
    // if (resultArray.length === 0) {
    //   return null;
    // }
    // return resultArray[0];
  }

  /**
   * elimino tutti gli hendler presenti nell'array handlers
   * dopo aver cancellato la reference per ogni handlers
   */
  setOffAllReferences() {
    this.handlers.forEach((data) => {
      // const item = data.ref;
      // item.ref.off();
    });
    this.handlers = [];
  }
  /// END metodi gestione messaggi conversazione ////

  /// START metodi gestione conversazioni ////
  /**
   * Salvo il CONVERSATIONS handler dopo averlo creato nella lista conversazioni
   */
  setConversationsHandler(handler) {
    this.conversationsHandlerService = handler;
  }
  setArchivedConversationsHandler(handler) {
    this.archivedConversationsService = handler;
  }


  /**
   * elimino la reference dell'handler delle conversazioni
   */
  disposeConversationsHandler() {
    console.log(' 2 - this.conversationsHandler:: ', this.conversationsHandlerService);
    this.conversationsHandlerService.dispose();
  }
  /// END metodi gestione conversazioni ////

  /// START metodi sincronizzazione contatti ////
  /**
   * creo handler sincronizzazione contatti se ancora nn esiste
   * inizio la sincronizzazione
   */
  // initContactsSynchronizer() {
  //   console.log(' initContactsSynchronizer:: ', this.contactsSynchronizer, this.tenant, this.currentUser);
  //   if (!this.contactsSynchronizer) {
  //     this.contactsSynchronizer = this.chatContactsSynchronizer.initWithTenant(this.tenant, this.currentUser);
  //     //this.contactsSynchronizer = this.createContactsSynchronizerForUser();
  //     this.contactsSynchronizer.startSynchro();
  //   } else {
  //     this.contactsSynchronizer.startSynchro();
  //   }
  // }
  /**
   * elimino la reference dell'handler della sincronizzazione contatti
   */
  // disposeContactsSynchronizer() {
  //   this.contactsSynchronizer.dispose();
  // }
  /// END metodi sincronizzazione contatti ////



}
