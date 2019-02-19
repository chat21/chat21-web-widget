export class DepartmentModel {
    constructor(
        public appId: string,
        public createdAt: string,
        public createdBy: string,
        public name: string,
        public updatedAt: string,
        public _id: string,
        public offline_msg: string,
        public online_msg: string
    ) { }
 }
