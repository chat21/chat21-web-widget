export interface User {
    _id: string;
    updatedAt: any;
    createdAt: any;
    id_project: string;
    id_user: string;
    user_available?: boolean;
    role: string;
    createdBy: string;
    is_group_member: boolean;
    __v: any;
}