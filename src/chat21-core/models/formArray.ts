export class FormArray {
    constructor(
        public label?: string | {},
        public errorLabel?: string | {},
        public name?: string,
        public type?: string,
        public mandatory?: boolean,
        public regex?: string,
        public value?: string,
        public options?: Array<any>
      ) { }
}