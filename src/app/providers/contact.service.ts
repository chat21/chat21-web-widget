import { Injectable } from '@angular/core';

// firebase
import * as firebase from 'firebase/app';
import 'firebase/database';
import 'firebase/storage';

// models
import { ContactModel } from '../../models/contact';
import { Globals } from '../utils/globals';


@Injectable()
export class ContactService {

  listContacts: ContactModel[];
  tenant: string;
  conversationId: string;
  urlNodeFirebaseContact: string;
  urlNodeFirebaseGroup: string;
  userId: string;

  constructor(
    public g: Globals
  ) {
   }

  initialize(userId, tenant, conversationId) {
    this.listContacts = [];
    const that = this;
    this.tenant = tenant;
    this.conversationId = conversationId;
    this.userId = userId;
    // recupero elenco partecipanti alla chat
    this.urlNodeFirebaseGroup = '/apps/' + this.tenant + '/users/' + this.userId + '/groups/' + this.conversationId + '/members';
    const firebaseGroup = firebase.database().ref(this.urlNodeFirebaseGroup)
    .once('value').then(function(snapshot) {
      //  wdLog('snapshot.val() *****', snapshot);
      that.getProfileUser(snapshot);
    });
  }

  getProfileUser(snapshot) {
    const that = this;
    snapshot.forEach(
      function(childSnapshot) {
        //  wdLog('arrayUser *****', childSnapshot.key);
        that.urlNodeFirebaseContact = '/apps/' + that.tenant + '/contacts/' + childSnapshot.key;
        const firebaseContact = firebase.database().ref(that.urlNodeFirebaseContact)
        .once('value').then(function(snapshotContact) {
          //  wdLog('contact.val() *****', snapshotContact.val());
          if (snapshotContact.val()) {
            const contact: ContactModel = snapshotContact.val();
            that.listContacts.push(contact);
          }
        });
      }
    );
    //  wdLog('listContacts *****', this.listContacts);
  }

  getContactProfile(uid): ContactModel {
    const profiloContatto =  this.listContacts.filter(function(handler) {
      return handler.uid === uid;
    });
    return profiloContatto[0];
  }

  // setImageProfile(agent) {
  //   const IMG_PROFILE_SUPPORT = 'https://user-images.githubusercontent.com/32448495/39111365-214552a0-46d5-11e8-9878-e5c804adfe6a.png';
  //   agent.image = IMG_PROFILE_SUPPORT;
  //   const urlNodeConcacts = '/apps/' + this.tenant + '/contacts/' + agent.id + '/imageurl/';
  //   return firebase.database().ref(urlNodeConcacts).once('value');
  // }

  profileImage(uidContact, format?) {
    // console.log('display format::' + format);
    if (uidContact && uidContact !== '') {
      let urlImagesNodeFirebase;
      if (format === 'thumb') {
        urlImagesNodeFirebase = '/profiles/' + uidContact + '/thumb_photo.jpg';
      } else {
        urlImagesNodeFirebase = '/profiles/' + uidContact + '/photo.jpg';
      }
      return firebase.storage().ref().child(urlImagesNodeFirebase).getDownloadURL();
    }
  }

}
