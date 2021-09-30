import { transition } from '@angular/animations';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormArray } from './../../../../chat21-core/models/formArray';
import { Component, OnInit, SimpleChange, EventEmitter, Output, Input } from '@angular/core';
import { CustomTranslateService } from '../../../../chat21-core/providers/custom-translate.service';
import { isString } from 'util';
import { LoggerService } from '../../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../../chat21-core/providers/logger/loggerInstance';
import { validateRegex } from '../../../../chat21-core/utils/utils';

@Component({
  selector: 'chat-form-builder',
  templateUrl: './form-builder.component.html',
  styleUrls: ['./form-builder.component.scss']
})
export class FormBuilderComponent implements OnInit {

  @Input() formArray: Array<FormArray>;
  @Input() isOpenPrechatForm: boolean;
  @Input() stylesMap: Map<string, string>;
  @Output() onSubmitForm = new EventEmitter<{}>();

  preChatFormGroupCustom:FormGroup;
  browserLang: string;
  preChatFormStruct: Array<any>;
  translationErrorLabelMap: Map<string, string>;
  translationMap: Map<string, string>
  submitted: boolean = false;

  private logger: LoggerService = LoggerInstance.getInstance()

  constructor(private formBuilder: FormBuilder,
              private customTranslateService: CustomTranslateService,) { }

  ngOnInit() {
    const key = [ 'LABEL_ERROR_FIELD_REQUIRED' ]
    const translationKey =[ 'LABEL_START_NW_CONV']
    this.translationErrorLabelMap = this.customTranslateService.translateLanguage(key)
    this.translationMap = this.customTranslateService.translateLanguage(translationKey)
  }

  ngOnChanges(changes: SimpleChange){
    if(this.formArray){
      this.browserLang = navigator.language
      this.preChatFormGroupCustom = this.buildFormGroup(this.formArray);
      this.formArray = this.setTranslations(this.formArray)
      this.formArray = this.setErrorTranslations(this.formArray)
    }
  }

  buildFormGroup(inputJson: Array<FormArray>): FormGroup {
    let objectFormBuilder: { [key: string]: FormControl } = {}
    inputJson.forEach(child => {
      if(child.type && (child.type === 'string' || child.type === 'textarea')){
        let validatorsObject: any[] = []
        let defaultValue: string = null
        child.mandatory? validatorsObject.push(Validators.required) : null
        child.regex? validatorsObject.push(Validators.pattern(new RegExp(validateRegex(child.regex).slice(1,-1)))) : null
        child.value? defaultValue= child.value : null
        objectFormBuilder[child.name] = new FormControl(defaultValue, Validators.compose(validatorsObject))
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

  setErrorTranslations(inputJson: Array<FormArray>): Array<FormArray> {
    inputJson.forEach(element => {
      if(element.errorLabel){
        Object.keys(element.errorLabel).forEach((errorKey) => {
          if(typeof element.errorLabel[errorKey] === 'object'){
            //check if a key in label object contains browser language
            let translation:string = ''
            Object.keys(element.errorLabel[errorKey]).forEach((lang)=> {
              if(this.browserLang.includes(lang.substring(0,2))){
                return translation = element.errorLabel[errorKey][lang]
              }
            })
            translation === ''?  translation= element.errorLabel[errorKey][0] : null 
            Object(element.errorLabel)[errorKey] = translation
          } else if (isString(element.errorLabel)){
            return element.errorLabel[errorKey] = this.customTranslateService.translateLanguage([element.errorLabel[errorKey]]).get(element.errorLabel[errorKey])
          }
        })
      } 
    })
    return this.formArray
  }

  onSubmitPreChatForm(){
    this.logger.debug('[FORM-BUILDER] submitted before', this.submitted)
    this.submitted = true;
    this.logger.debug('[FORM-BUILDER] submitted', this.submitted)
    this.logger.debug('[FORM-BUILDER] onSubmitPreChatForm', this.preChatFormGroupCustom)
    if(this.preChatFormGroupCustom.valid){
      this.onSubmitForm.emit(this.preChatFormGroupCustom.value)
    }
  }

  onResetForm(){
    this.submitted = false;
    this.preChatFormGroupCustom.reset();
  }
}
