import { TrxTransactionCost } from './TrxTransactionCost';
import { TrxTransactionContractData } from './TrxTransactionContractData';

export class TrxTransaction {
    constructor() {}

    block: number;
    hash: string;
    timestamp: number;
    ownerAddress: string;
    contractRet: string;
    toAddress: string;
    contractType: number;
    confirmed: boolean;
    contractData: TrxTransactionContractData;
    data: string;
    cost: TrxTransactionCost;
    trigger_info: object;
    internal_transactions: object;
    latest_block: number;
}