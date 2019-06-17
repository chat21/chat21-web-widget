import { Component, OnInit, Output, EventEmitter, ElementRef, AfterViewInit, ViewChild } from '@angular/core';

import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Globals } from '../../utils/globals';
import { StorageService } from '../../providers/storage.service';

@Component({
  selector: 'tiledeskwidget-prechat-form',
  templateUrl: './prechat-form.component.html',
  styleUrls: ['./prechat-form.component.scss']
})

export class PrechatFormComponent implements OnInit, AfterViewInit {
  @ViewChild('afPrechatFormComponent') private afPrechatFormComponent: ElementRef;

  // ========= begin:: Input/Output values ===========//
  @Output() eventClosePage = new EventEmitter();
  @Output() eventCloseForm = new EventEmitter();
  // ========= end:: Input/Output values ===========//


  // ========= begin:: component variables ======= //
  preChatFormGroup: FormGroup;
  userFullname: string;
  userEmail: string;
  // ========= end:: component variables ======= //

  constructor(
    public g: Globals,
    public formBuilder: FormBuilder,
    public storageService: StorageService
  ) {

  }

  ngOnInit() {
    this.initialize();
  }

  initialize() {
    this.preChatFormGroup = this.createForm(this.formBuilder);
    if (this.preChatFormGroup) {
      this.subcribeToFormChanges();
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

      this.g.setAttributeParameter('userFullname', this.userFullname);
      this.g.setAttributeParameter('userEmail', this.userEmail);
      // attributes['userFullname'] = this.userFullname;
      // attributes['userEmail'] = this.userEmail;
      // this.g.setParameter('attributes', attributes);
      this.storageService.setItem('attributes', JSON.stringify(attributes));
      this.eventCloseForm.emit();
    } else {
      // mostro messaggio di errore
    }
  }

  returnClosePage() {
    this.eventClosePage.emit();
  }
  // ========= end:: ACTIONS ============//


}
