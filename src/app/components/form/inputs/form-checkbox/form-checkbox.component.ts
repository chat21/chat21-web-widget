import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormArray } from '../../../../../chat21-core/models/formArray';

@Component({
  selector: 'chat-form-checkbox',
  templateUrl: './form-checkbox.component.html',
  styleUrls: ['./form-checkbox.component.scss']
})
export class FormCheckboxComponent implements OnInit {

  @Input() element: FormArray;
  @Input() controlName: string;
  @Input() translationErrorLabelMap: Map<string, string>;
  @Input() stylesMap: Map<string, string>;
  @Input() hasSubmitted: boolean; 
  
  form: FormGroup;
  constructor(private rootFormGroup: FormGroupDirective,
              private elementRef: ElementRef) { }

  ngOnInit() {
    this.form = this.rootFormGroup.control;
    this.elementRef.nativeElement.style.setProperty('--themeColor', this.stylesMap.get('themeColor'));
    this.elementRef.nativeElement.style.setProperty('--foregroundColor', this.stylesMap.get('foregroundColor'));
    
  }

}
