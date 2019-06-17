import { EosActionData } from './EosActionData';

export class EosAction {
    constructor() {}

    account: string;
    name: string;
    authorization: Map<string, string>;
    data: EosActionData;
    hex_data: string;
}