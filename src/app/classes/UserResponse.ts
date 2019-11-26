import { User } from './user.class';

export class UserResponse extends User {

    token: string;
    searchLimit: number;
    saveLimit: number;
}