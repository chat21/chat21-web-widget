import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';
import { FormArray } from '../../../../../chat21-core/models/formArray';

@Component({
  selector: 'chat-form-textarea',
  templateUrl: './form-textarea.component.html',
  styleUrls: ['./form-textarea.component.scss']
})
export class FormTextareaComponent implements OnInit {

  @Input() element: FormArray;
  @Input() controlName: string;
  @Input() cols: number;   
  @Input() translationErrorLabelMap: Map<string, string>;
  @Input() stylesMap: Map<string, string>;
  @Input() hasSubmitted: boolean; 

  @ViewChild('div_input') input: ElementRef;
  form: FormGroup;
  constructor(private rootFormGroup: FormGroupDirective,
              private elementRef: ElementRef) { }

  ngOnInit() {
    this.form = this.rootFormGroup.control as FormGroup;
    this.elementRef.nativeElement.style.setProperty('--themeColor', this.stylesMap.get('themeColor'));
    this.elementRef.nativeElement.style.setProperty('--foregroundColor', this.stylesMap.get('foregroundColor'));
    this.form.controls[this.controlName].valueChanges.subscribe((value) => {
      this.hasSubmitted= false;
      this.setFormStyle();
    })
  }

  // ngOnChanges(changes: SimpleChange){
  //   if(this.hasSubmitted){
  //     this.input.nativeElement.classList.add('is-focused')
  //     this.setFormStyle()
  //   }
  // }

  onFocusOut(){
    this.input.nativeElement.classList.remove('is-focused')
  }

  onFocus(){
    this.input.nativeElement.classList.add('is-focused')
  }


  setFormStyle(){
    if(this.form.controls[this.controlName].hasError('pattern') || 
      this.form.controls[this.controlName].hasError('required') || 
      this.form.controls[this.controlName].invalid){
        this.input.nativeElement.classList.add('form-danger')
    } else if (this.form.controls[this.controlName].valid){
        this.input.nativeElement.classList.add('form-success')
    }
  }

}
