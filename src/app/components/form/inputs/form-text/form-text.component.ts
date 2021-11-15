import { style } from '@angular/animations';
import { Component, ElementRef, Input, OnInit, SimpleChange, ViewChild, OnChanges, Output, EventEmitter } from '@angular/core';
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
  @Input() translationErrorLabelMap: Map<string, string>;
  @Input() stylesMap: Map<string, string>;
  @Input() hasSubmitted: boolean; 
  @Output() onKeyEnterPressed = new EventEmitter<any>();

  @ViewChild('div_input') input: ElementRef;
  form: FormGroup;
  inputType: string = 'text'
  constructor(private rootFormGroup: FormGroupDirective,
              private elementRef: ElementRef) { }

  ngOnInit() {
    this.form = this.rootFormGroup.control as FormGroup;
    this.elementRef.nativeElement.style.setProperty('--themeColor', this.stylesMap.get('themeColor'));
    this.elementRef.nativeElement.style.setProperty('--foregroundColor', this.stylesMap.get('foregroundColor'));
    if(this.form.controls && this.form.controls[this.controlName]){
      this.form.controls[this.controlName].valueChanges.subscribe((value) => {
        this.hasSubmitted= false;
        this.setFormStyle();
      })
    }
  }

  ngOnChanges(changes: SimpleChange){
    if(this.controlName && (this.controlName.toLowerCase().includes('email') || this.controlName.toLowerCase().includes('e-mail')) ){
      this.inputType = 'email';
    }
    // if(this.hasSubmitted){
    //   this.input.nativeElement.classList.add('is-focused')
    //   this.setFormStyle()
    // }
  }

  onFocusOut(){
    this.input.nativeElement.classList.remove('is-focused')
  }

  onFocus(){
    this.input.nativeElement.classList.add('is-focused')
  }

  /**
   * FIRED when user press ENTER button on keyboard 
   * @param event 
   */
  onEnterPressed(event){
    this.onKeyEnterPressed.emit(event)
  }

  setFormStyle(){
    if(this.form.controls[this.controlName].hasError('pattern') || 
      this.form.controls[this.controlName].hasError('required') || 
      this.form.controls[this.controlName].invalid){
        this.input.nativeElement.classList.add('form-danger')
        this.input.nativeElement.classList.remove('form-success')
    } else if (this.form.controls[this.controlName].valid){
        this.input.nativeElement.classList.remove('form-danger')
        this.input.nativeElement.classList.add('form-success')
    }
  }

}
