import { User } from './User';

export class UserResponse extends User {

    token: string;
    searchLimit: number;
    saveLimit: number;
}