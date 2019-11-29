export class User {
    constructor() {}

    userId: string;
    username: string;
    email: string;
    accountTypeId: number;
    accountType: string;
    expirationDate: number;
    created: number;
    validated: number;
    message: string;
    searchLimit: number;
    saveLimit: number;
    savedHunts: number;
    emailSubscription: boolean;
    adFree: boolean = false;
}