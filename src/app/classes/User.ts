import { AccountType } from './Enums';

export class User {
    constructor() {}

    userId: string;
    username: string;
    email: string;
    accountType: AccountType;
    expirationDate: string;
    createdDate: string;
}