import { BtcTransaction } from './BtcTransaction';

export class BtcPage<T> {
    constructor() {}

    total_count: number;
    page: number;
    pagesize: number;
    list: T[];
}