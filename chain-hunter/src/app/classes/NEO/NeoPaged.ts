import { NeoAddressTxn } from './NeoAddressTxn';

export class NeoPaged {
    constructor() {}

    total_pages: number;
    total_entries: number;
    page_size: number;
    page_number: number;
    entries: NeoAddressTxn[];
}