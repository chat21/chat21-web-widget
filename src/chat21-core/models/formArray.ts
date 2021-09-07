export class FormArray {
    constructor(
        public label?: string | {},
        public name?: string,
        public type?: string,
        public mandatory?: boolean,
        public regex?: string,
      ) { }
}