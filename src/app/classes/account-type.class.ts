export class AccountType {
    constructor() {}

    id: number;
    uuid: string;
    name: string;
    searchLimit: number;
    saveLimit: number;
    monthly: number;
    yearly: number;
    description: string;
    tag: string;
    registrationRequired: boolean;
    sortOrder: number;
    adFree: boolean;
}