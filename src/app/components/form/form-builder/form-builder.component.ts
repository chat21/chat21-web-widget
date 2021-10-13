import { transition } from '@angular/animations';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { FormArray } from './../../../../chat21-core/models/formArray';
import { Component, OnInit, SimpleChange, EventEmitter, Output, Input, ChangeDetectorRef } from '@angular/core';
import { CustomTranslateService } from '../../../../chat21-core/providers/custom-translate.service';
import { isString } from 'util';
import { LoggerService } from '../../../../chat21-core/providers/abstract/logger.service';
import { LoggerInstance } from '../../../../chat21-core/providers/logger/loggerInstance';
import { validateRegex } from '../../../../chat21-core/utils/utils';
import * as parser from 'accept-language-parser'

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
  @Output() onErrorRenderForm = new EventEmitter()

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
    this.logger.debug('[FORM-BUILDER] ngOnChanges: preChatFormJson ---->', this.formArray)
    this.logger.debug('[FORM-BUILDER] ngOnChanges: preChatForm completed ---->', this.preChatFormGroupCustom)
  }

  ngOnChanges(changes: SimpleChange){
    if(this.formArray){
      this.browserLang = navigator.language
      this.preChatFormGroupCustom = this.buildFormGroup(this.formArray);
      this.formArray = this.setTranslations(this.formArray)
      this.subscribeToFormChanges()
    }
  }

  buildFormGroup(inputJson: Array<FormArray>): FormGroup {
    let objectFormBuilder: { [key: string]: FormControl } = {}
    let restoreDefault = false;
    inputJson.forEach(child => {
      // child.type = child.type.toLowerCase()
      if(!child.name) return; // if 'name' property not exist, NOT RENDER CURRENT FIELD
      
      child.label? child.label : child.label= child.name; //if 'label' property not exist, set 'name' property as its value
      child.type? child.type = child.type.toLowerCase() :  child.type = 'text' // if 'type' property not exist, set 'text' as default value
      
      if(child.type && (child.type === 'text' || child.type === 'textarea')){
        let validatorsObject: any[] = []
        let defaultValue: any = null
        child.mandatory? validatorsObject.push(Validators.required) : null
        child.regex? validatorsObject.push(Validators.pattern(new RegExp(validateRegex(child.regex).slice(1,-1)))) : null
        child.value? defaultValue= child.value : null
        objectFormBuilder[child.name] = new FormControl(defaultValue, Validators.compose(validatorsObject))
      } else if (child.type === 'checkbox'){
        let validatorsObject: any[] = []
        let defaultValue: boolean = false
        child.mandatory? validatorsObject.push(Validators.required, Validators.requiredTrue) : null
        child.value? defaultValue = (child.value=== 'true' || child.value=== true) : null
        objectFormBuilder[child.name] = new FormControl(defaultValue, Validators.compose(validatorsObject))
      } else if(child.type === 'label'){
        // type: 'label' not need to render as FormControl object in formBuilder --> skip it
        return;
      } else {
        this.logger.error('[FORM-BUILDER] ERROR while rendering field --> RESTORE DEFAULT')
        restoreDefault = true
        // this.onErrorRenderForm.emit()
        return;
      }
    });

    if(restoreDefault){
      objectFormBuilder = {};
      this.logger.error('[FORM-BUILDER] ERROR while rendering field --> restoreDefault', objectFormBuilder)
      this.onErrorRenderForm.emit();
    }
    return this.formBuilder.group(objectFormBuilder)
  }

  


  setTranslations(inputJson: Array<FormArray>): Array<FormArray> {
    inputJson.forEach(element => {
      /** 'label' property */
      if(typeof element.label === 'object'){
        //check if a key in label object contains browser language
        const language = this.getAcceptLanguage(element.label)
        this.logger.debug('[FORM-BUILDER] setTranslations acceptedLanguage for element.label:', element, language)
        element.label= element.label[language]
        // let translation = ''
        // Object.keys(element.label).forEach((lang)=> {
        //   if(this.browserLang.includes(lang.substring(0,2))){
        //     return translation = element.label[lang]
        //   }
        // })
        // translation === ''?  translation= element.label[0] : null 
        // element.label = translation
      } else if (isString(element.label)){
        return element.label = this.customTranslateService.translateLanguage([element.label]).get(element.label)
      }

      /** 'erroLabel' property */
      if(typeof element.errorLabel === 'object'){
        //check if a key in label object contains browser language
        const language = this.getAcceptLanguage(element.errorLabel)
        this.logger.debug('[FORM-BUILDER] setTranslations acceptedLanguage for element.errorLabel:', element, language)
        element.errorLabel= element.errorLabel[language]
        // let translation = ''
        // Object.keys(element.errorLabel).forEach((lang)=> {
        //   if(this.browserLang.includes(lang.substring(0,2))){
        //     return translation = element.errorLabel[lang]
        //   }
        // })
        // translation === ''?  translation= element.errorLabel[0] : null 
        // element.errorLabel = translation
      } else if (isString(element.errorLabel)){
        return element.errorLabel = this.customTranslateService.translateLanguage([element.errorLabel]).get(element.errorLabel)
      }

    })

    return this.formArray
  }

  getAcceptLanguage(languages: {}): string {
    let arrayLang=''
    let language = ''
    if(languages && languages['default']){
      language = 'default'
      // delete languages['default'] //NOT NECESSARY TO DELETE THE 'default' KEY
    }

    navigator.languages.forEach(lang => {
      arrayLang += lang + ',' 
    })
    const parse = parser.pick(Object.keys(languages), arrayLang)
    parse? language = parse : null
    return language
  }

  subscribeToFormChanges(){
    if(this.preChatFormGroupCustom){
      this.preChatFormGroupCustom.valueChanges.subscribe(value => {
        this.submitted = false;
      })
    }
    
  }

  onSubmitPreChatForm(){
    this.submitted = true;
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
