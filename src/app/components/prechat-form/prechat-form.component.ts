import { Component, OnInit, Output, EventEmitter, ElementRef, AfterViewInit, ViewChild } from '@angular/core';

import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { isString } from 'util';
import { AppStorageService } from '../../../chat21-core/providers/abstract/app-storage.service';
import { CustomTranslateService } from '../../../chat21-core/providers/custom-translate.service';
import { Globals } from '../../utils/globals';

@Component({
  selector: 'chat-prechat-form',
  templateUrl: './prechat-form.component.html',
  styleUrls: ['./prechat-form.component.scss']
})

export class PrechatFormComponent implements OnInit, AfterViewInit {
  @ViewChild('afPrechatFormComponent') private afPrechatFormComponent: ElementRef;
  @ViewChild('privacyInputField') private privacyInputField: ElementRef;
  // ========= begin:: Input/Output values ===========//
  @Output() onClosePage = new EventEmitter();
  @Output() onCloseForm = new EventEmitter();
  // ========= end:: Input/Output values ===========//


  // ========= begin:: component variables ======= //
  preChatFormGroup: FormGroup;
  preChatFormGroupCustom:FormGroup;
  userFullname: string;
  userEmail: string;
  // ========= end:: component variables ======= //

  colorBck: string;
  preChatFormStruct: Array<any>;
  translationLabelMap: Map<string, string>;
  constructor(
    public g: Globals,
    public formBuilder: FormBuilder,
    public appStorageService: AppStorageService,
    private customTranslateService: CustomTranslateService,
  ) {

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.colorBck = '#000000';
    this.preChatFormGroup = this.createForm(this.formBuilder);
    if (this.preChatFormGroup) {
      this.subcribeToFormChanges();
    }

    this.preChatFormStruct = [
      {
        label: "TEL",
        name: "tel",
        type: "string",
        mandatory: true,
        regex: "[0-9]*"
      },
      {
       label: {
          en: "Email", // pivot
          it: "Indirizzo email"
        },
        name: "email",
        type: "string",
        mandatory: false,
        regex: "/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/"
      },
      {
        label: "Prima di proseguire devi accettare l’informativa Privacy (<a href='URL'>leggi</a>)",
        type: "label" // oppure assente?
      },
      {
        label: {
          en: "Accept", // pivot
          it: "Accetto"
        },
        name: "privacy",
        type: "checkbox",
        mandatory: true // nel caso check "spunta"
      }
    ];

    this.preChatFormGroupCustom = this.buildFormGroup(this.preChatFormStruct);
    console.log('formmmmmm', this.preChatFormGroupCustom)
    console.log('formmmmmm keyss', Object.keys(this.preChatFormGroupCustom.controls))

    
  }

  buildFormGroup(inputJson: any[]): FormGroup {
    let objectFormBuilder: { [key: string]: FormControl } = {}
    this.preChatFormStruct.forEach(child => {
      if(child.type && (child.type === 'string' || child.type === 'checkbox')){
        let validatorsObject: any[] = []
        child.mandatory? validatorsObject.push(Validators.required) : null
        child.regex? validatorsObject.push(Validators.pattern(new RegExp(child.regex))) : null
        objectFormBuilder[child.name] = new FormControl(null, Validators.compose(validatorsObject))
      } 
    })
    return this.formBuilder.group(objectFormBuilder)
  }

  returnTranslation(label: string | {}): string {
    console.log('labelllll', label)
    if(typeof label === 'object'){
      //check if a key in label object contains browser language
      return 'translate'
    }else if (isString(label)){
      return this.customTranslateService.translateLanguage([label]).get(label)
    }
    
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
  createForm(formBuilder): FormGroup {
    // SET FORM
    // const EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    // tslint:disable-next-line:max-line-length
    const EMAIL_REGEXP = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const preChatFormGroupTemp = formBuilder.group({
        email: [this.userEmail, Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
        name: [this.userFullname, Validators.compose([Validators.minLength(2), Validators.required])]
    });
    return preChatFormGroupTemp;
  }

  /** */
  subcribeToFormChanges() {
    const that = this;
    const preChatFormValueChanges$ = this.preChatFormGroup.valueChanges;
    preChatFormValueChanges$.subscribe(x => {
      that.userFullname = x.name;
      that.userEmail = x.email;
    });
  }

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
  checkInput() {
    const spanCheck = window.document.getElementById('span-checkmark');
    // console.log('-----------> ', spanCheck);
    if (spanCheck) {
      spanCheck.classList.remove('unchecked');
    }
  }

  returnClosePage() {
    this.onClosePage.emit();
  }
  // ========= end:: ACTIONS ============//


}
