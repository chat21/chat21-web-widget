import { Component, Input, OnInit, SimpleChange } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { FormArray } from '../../../../../chat21-core/models/formArray';

@Component({
  selector: 'chat-form-text',
  templateUrl: './form-text.component.html',
  styleUrls: ['./form-text.component.scss']
})
export class FormTextComponent implements OnInit {

  @Input() element: FormArray;
  @Input() controlName: string;
  @Input() hasSubmitted: boolean; 

  form: FormGroup;
  constructor(private rootFormGroup: FormGroupDirective) { }

  ngOnInit() {
    this.form = this.rootFormGroup.control;
  }

}
