import { FormArray } from './../../../chat21-core/models/formArray';
import { Component, OnInit, Output, EventEmitter, ElementRef, AfterViewInit, ViewChild, Input } from '@angular/core';

import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { isString } from 'util';
import { AppStorageService } from '../../../chat21-core/providers/abstract/app-storage.service';
import { CustomTranslateService } from '../../../chat21-core/providers/custom-translate.service';
import { Globals } from '../../utils/globals';
import { LoggerService } from '../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../chat21-core/providers/logger/loggerInstance';

@Component({
  selector: 'chat-prechat-form',
  templateUrl: './prechat-form.component.html',
  styleUrls: ['./prechat-form.component.scss']
})

export class PrechatFormComponent implements OnInit, AfterViewInit {
  @ViewChild('afPrechatFormComponent') private afPrechatFormComponent: ElementRef;
  @ViewChild('privacyInputField') private privacyInputField: ElementRef;
  // ========= begin:: Input/Output values ===========//
  @Input() stylesMap: Map<string, string>;
  @Output() onClosePage = new EventEmitter();
  @Output() onCloseForm = new EventEmitter();
  // ========= end:: Input/Output values ===========//


  // ========= begin:: component variables ======= //
  preChatFormGroup: FormGroup;
  userFullname: string;
  userEmail: string;
  // ========= end:: component variables ======= //

  colorBck: string;
  browserLang: string;
  private logger: LoggerService = LoggerInstance.getInstance();

  constructor(
    public g: Globals,
    public formBuilder: FormBuilder,
    public appStorageService: AppStorageService
  ) {

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.colorBck = '#000000';
    // this.preChatFormGroup = this.createForm(this.formBuilder);
    // if (this.preChatFormGroup) {
    //   this.subcribeToFormChanges();
    // }
  
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.afPrechatFormComponent) {
        this.afPrechatFormComponent.nativeElement.focus();
      }
    }, 1000);
  }


  // START FORM
  // https://scotch.io/tutorials/using-angular-2s-model-driven-forms-with-formgroup-and-formcontrol

  /** */
  // createForm(formBuilder): FormGroup {
  //   // SET FORM
  //   // const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
  //   // tslint:disable-next-line:max-line-length
  //   const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //   const preChatFormGroupTemp = formBuilder.group({
  //       email: [this.userEmail, Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
  //       name: [this.userFullname, Validators.compose([Validators.minLength(2), Validators.required])]
  //   });
  //   return preChatFormGroupTemp;
  // }

  /** */
  // subcribeToFormChanges() {
  //   const that = this;
  //   const preChatFormValueChanges$ = this.preChatFormGroup.valueChanges;
  //   preChatFormValueChanges$.subscribe(x => {
  //     that.userFullname = x.name;
  //     that.userEmail = x.email;
  //   });
  // }

  // ========= begin:: ACTIONS ============//
  openNewConversation() {
    if (this.g.attributes) {
      const attributes = this.g.attributes;
      if ( this.privacyInputField && this.privacyInputField.nativeElement.checked === false) {
        // console.log(this.privacyInputField.nativeElement.checked);
        this.g.privacyApproved = false;
        const spanCheck = window.document.getElementById('span-checkmark');
        // console.log('-----------> ', spanCheck);
        if (spanCheck) {
          spanCheck.classList.add('unchecked');
        }
        return;
      } else if ( this.privacyInputField && this.privacyInputField.nativeElement.checked === true) {
        this.g.privacyApproved = true;
      }
      this.g.setAttributeParameter('privacyApproved', this.g.privacyApproved);
      this.g.setAttributeParameter('userFullname', this.userFullname);
      this.g.setAttributeParameter('userEmail', this.userEmail);
      this.g.setParameter('userFullname', this.userFullname);
      this.g.setParameter('userEmail', this.userEmail);
      // attributes['userFullname'] = this.userFullname;
      // attributes['userEmail'] = this.userEmail;
      // this.g.setParameter('attributes', attributes);
      this.appStorageService.setItem('attributes', JSON.stringify(attributes));
      this.onCloseForm.emit();
    } else {
      // mostro messaggio di errore
    }
  }


  /**  */
  // checkInput() {
  //   const spanCheck = window.document.getElementById('span-checkmark');
  //   // console.log('-----------> ', spanCheck);
  //   if (spanCheck) {
  //     spanCheck.classList.remove('unchecked');
  //   }
  // }

  returnClosePage() {
    this.onClosePage.emit();
  }

  onSubmitForm(form: {}){
    this.logger.debug('[PRE-CHAT-FORM] onSubmitForm:', form)
    if(this.g.attributes){
      if(form.hasOwnProperty('userFullname')){
        this.g.setAttributeParameter('userFullname', form['userFullname']);
        this.g.setParameter('userFullname', form['userFullname']);
      }
      if(form.hasOwnProperty('userEmail')){
        this.g.setAttributeParameter('userEmail', form['userEmail']);
        this.g.setParameter('userEmail', form['userEmail']);
      }
      this.g.attributes['preChatForm'] = form
      this.appStorageService.setItem('attributes', JSON.stringify(this.g.attributes));
      this.onCloseForm.emit();
    }
  }

  onErrorRenderForm(){
    this.logger.debug('[PRE-CHAT-FORM] onErrorRenderForm: RESTORE DEFAULT JSON')
    const defaultPreChatFormJson = [{name: "userFullname", type:"text", mandatory:true, label:{ en:"User fullname", it:"Nome utente"}},{name:"userEmail", type:"text", mandatory:true, regex:"/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/", label:{ en:"Email", it: "Indirizzo email"},"errorLabel":{ en:"Invalid email address", it:"Indirizzo email non valido"}}]
    this.g.setParameter('preChatFormJson', defaultPreChatFormJson)
  }
  // ========= end:: ACTIONS ============//


}
