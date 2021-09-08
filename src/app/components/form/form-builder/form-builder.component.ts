import { CheckboxComponent } from './../inputs/checkbox/checkbox.component';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormArray } from './../../../../chat21-core/models/formArray';
import { Component, OnInit, SimpleChange, EventEmitter, Output, Input } from '@angular/core';
import { CustomTranslateService } from '../../../../chat21-core/providers/custom-translate.service';
import { isString } from 'util';

@Component({
  selector: 'chat-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {

  @Input() formArray: Array<FormArray>;
  @Input() isOpenPrechatForm: boolean;
  @Output() onSubmitForm = new EventEmitter<{}>();

  preChatFormGroupCustom:FormGroup;
  browserLang: string;
  preChatFormStruct: Array<any>;
  translationLabelMap: Map<string, string>;
  submitted: boolean = false;

  constructor(private formBuilder: FormBuilder,
              private customTranslateService: CustomTranslateService,) { }

  ngOnInit() {
    
  }

  ngOnChanges(changes: SimpleChange){
    if(this.formArray){
      this.browserLang = navigator.language
      this.preChatFormGroupCustom = this.buildFormGroup(this.formArray);
      this.formArray = this.setTranslations(this.formArray)
    }
  }

  buildFormGroup(inputJson: Array<FormArray>): FormGroup {
    let objectFormBuilder: { [key: string]: FormControl } = {}
    inputJson.forEach(child => {
      if(child.type && (child.type === 'string')){
        let validatorsObject: any[] = []
        child.mandatory? validatorsObject.push(Validators.required) : null
        child.regex? validatorsObject.push(Validators.pattern(new RegExp(child.regex))) : null
        objectFormBuilder[child.name] = new FormControl(null, Validators.compose(validatorsObject))
      }else if (child.type === 'checkbox'){
        let validatorsObject: any[] = []
        child.mandatory? validatorsObject.push(Validators.required, Validators.requiredTrue) : null
        objectFormBuilder[child.name] = new FormControl(false, Validators.compose(validatorsObject))
      }
    })
    return this.formBuilder.group(objectFormBuilder)
  }


  setTranslations(inputJson: Array<FormArray>): Array<FormArray> {
    inputJson.forEach(element => {
      if(typeof element.label === 'object'){
        //check if a key in label object contains browser language
        let translation = ''
        Object.keys(element.label).forEach((lang)=> {
          if(this.browserLang.includes(lang.substring(0,2))){
            return translation = element.label[lang]
          }
        })
        translation === ''?  translation= element.label[0] : null 
        element.label = translation
      } else if (isString(element.label)){
        return element.label = this.customTranslateService.translateLanguage([element.label]).get(element.label)
      }
    })
    return this.formArray
  }

  onSubmitPreChatForm(){
    this.submitted = true;
    this.onSubmitForm.emit(this.preChatFormGroupCustom.value)
  }

  onResetForm(){
    this.submitted = false;
    this.preChatFormGroupCustom.reset();
  }
}
