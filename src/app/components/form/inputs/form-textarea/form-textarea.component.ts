import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
  @Input() rows: number = 3;   
  @Input() translationErrorLabelMap: Map<string, string>;
  @Input() stylesMap: Map<string, string>;
  @Input() hasSubmitted: boolean; 
  @Output() onKeyEnterPressed = new EventEmitter<any>();

  @ViewChild('div_input') input: ElementRef;
  form: FormGroup;
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

  /**
   * FIRED when user press ENTER button on keyboard 
   * @param event 
   */
  onEnterPressed(event){
    event.preventDefault();
    this.onKeyEnterPressed.emit(event)
  }

  /**
  * HANDLE: cmd+enter, shiftKey+enter, alt+enter, ctrl+enter
  * @param event 
  */
  onkeydown(event){
    const keyCode = event.which || event.keyCode;
    // metaKey -> COMMAND ,  shiftKey -> SHIFT, altKey -> ALT, ctrlKey -> CONTROL
    if( (event.metaKey || event.shiftKey || event.altKey || event.ctrlKey) && keyCode===13){   
      event.preventDefault();
      this.form.controls[this.controlName].patchValue(this.form.controls[this.controlName].value + '\r\n')
    }
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
