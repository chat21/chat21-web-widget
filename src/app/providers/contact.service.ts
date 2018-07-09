import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';

// models
import { ContactModel } from '../../models/contact';


@Injectable()
export class ContactService {

  listContacts: ContactModel[];
  tenant: string;
  conversationId: string;
  urlNodeFirebaseContact: string;
  urlNodeFirebaseGroup: string;
  userId: string;

  constructor() { }

  initialize(userId, tenant, conversationId) {
    this.listContacts = [];
    const that = this;
    this.tenant = tenant;
    this.conversationId = conversationId;
    this.userId = userId;
    // recupero elenco partecipanti alla chat
    this.urlNodeFirebaseGroup = '/apps/' + this.tenant + '/users/' + this.userId + '/groups/' + this.conversationId + '/members';
    console.log('urlNodeFirebaseGroup *****', this.urlNodeFirebaseGroup);
    const firebaseGroup = firebase.database().ref(this.urlNodeFirebaseGroup)
    .once('value').then(function(snapshot) {
      // console.log('snapshot.val() *****', snapshot);
      that.getProfileUser(snapshot);
    });
  }

  getProfileUser(snapshot) {
    const that = this;
    snapshot.forEach(
      function(childSnapshot) {
        console.log('arrayUser *****', childSnapshot.key);
        that.urlNodeFirebaseContact = '/apps/' + that.tenant + '/contacts/' + childSnapshot.key;
        const firebaseContact = firebase.database().ref(that.urlNodeFirebaseContact)
        .once('value').then(function(snapshotContact) {
          console.log('contact.val() *****', snapshotContact.val());
          if (snapshotContact.val()) {
            const contact: ContactModel = snapshotContact.val();
            that.listContacts.push(contact);
          }
        });
      }
    );
    // console.log('listContacts *****', this.listContacts);
  }

  getContactProfile(uid): ContactModel {
    const profiloContatto =  this.listContacts.filter(function(handler) {
      return handler.uid === uid;
    });
    return profiloContatto[0];
  }

}
