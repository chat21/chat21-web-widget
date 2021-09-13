import { element } from 'protractor';
import { style } from '@angular/animations';
import { Component, ElementRef, Input, OnInit, SimpleChange, ViewChild } from '@angular/core';
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
  @Input() hasSubmitted: boolean; 

  @ViewChild('div_input') input: ElementRef;
  div_input: HTMLElement
  form: FormGroup;
  constructor(private rootFormGroup: FormGroupDirective) { }

  ngOnInit() {
    this.form = this.rootFormGroup.control;
    this.div_input =  document.getElementById('div_input') as HTMLElement;
    console.log('elementttt', this.element)
  }

  onFocusOut(){
    this.input.nativeElement.classList.remove('is-focused')
  }

  onFocus(){
    this.input.nativeElement.classList.add('is-focused')
  }

}
