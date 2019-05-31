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
  attributes: any;
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

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.afPrechatFormComponent) {
        this.afPrechatFormComponent.nativeElement.focus();
      }
    }, 1000);
}

  initialize() {
    this.attributes = this.g.attributes;
    this.preChatFormGroup = this.createForm(this.formBuilder);
    if (this.preChatFormGroup) {
      this.subcribeToFormChanges();
    }
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
       this.g.wdLog([' openNewConversation: ', that.userFullname, that.userEmail]);
    });
  }

  // ========= begin:: ACTIONS ============//
  openNewConversation() {
     this.g.wdLog([' openNewConversation: ']);
    this.attributes['userFullname'] = this.userFullname;
    this.attributes['userEmail'] = this.userEmail;
    if (this.g.attributes) {
        this.storageService.setItem('attributes', JSON.stringify(this.attributes));
        // this.g.attributes = this.attributes;
        this.eventCloseForm.emit();
    } else {
      // mostro messaggio di errore
    }
  }

  returnClosePage() {
     this.g.wdLog([' closePage: ']);
    this.eventClosePage.emit();
  }
  // ========= end:: ACTIONS ============//


}
