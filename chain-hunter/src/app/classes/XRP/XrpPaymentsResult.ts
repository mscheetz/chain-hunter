import { XrpAddressTransaction } from './XrpAddressTransaction';

export class XrpPaymentsResult {
    constructor() {}

    count: number;
    result: string;
    payments: XrpAddressTransaction[];
}