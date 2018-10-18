import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Globals } from '../../utils/globals';

@Component({
  selector: 'app-prechat-form',
  templateUrl: './prechat-form.component.html',
  styleUrls: ['./prechat-form.component.scss']
})
export class PrechatFormComponent implements OnInit {
  @Output() eventClosePage = new EventEmitter();
  @Output() eventCloseForm = new EventEmitter<any>();

  preChatFormGroup: FormGroup;

  constructor(
    public g: Globals,
    public formBuilder: FormBuilder
  ) {
    this.initialize();
  }

  ngOnInit() {
  }

  initialize() {
    // SET FORM
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
        email: [this.g.userEmail, Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
        name: [this.g.userFullname, Validators.compose([Validators.minLength(2), Validators.required])]
    });
    return preChatFormGroupTemp;
  }

  /** */
  subcribeToFormChanges() {
    const that = this;
    const preChatFormValueChanges$ = this.preChatFormGroup.valueChanges;
    preChatFormValueChanges$.subscribe(x => {
        that.g.userFullname = x.name;
        that.g.userEmail = x.email;
    });
  }

  /** */
  closeForm() {
    console.log(' closeForm: ');
    this.eventCloseForm.emit();
  }

  /** */
  closePage() {
    console.log(' closePage: ');
    this.eventClosePage.emit();
  }


}
