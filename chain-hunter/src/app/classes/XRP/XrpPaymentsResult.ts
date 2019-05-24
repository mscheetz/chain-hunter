import { XrpAddressTransaction } from './XrpAddressTransaction';

export class XrpPaymentsResult {
    constructor() {}

    public count: number;
    public result: string;
    public payments: XrpAddressTransaction[];
}