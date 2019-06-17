import { XrpTakerPay } from './XrpTakerPay';
import { XrpTakerGet } from './XrpTakerGet';
import { XrpTransactionAmount } from './XrpTransactionAmount';

export class XrpTransaction {
    constructor() {}

    TakerPays: XrpTakerPay;
    TakerGets: XrpTakerGet;
    meta: object;
    Paths: object[];
    Amount: XrpTransactionAmount;
    Account: string;
    Expiration: number;
    Fee: number;
    Flags: number;
    LastLedgerSequence: number;
    OfferSequence: number;
    Sequence: number;
    SigningPubKey: string;
    TransactionType: string;
    TxnSignature: string;
    hash: string;
    ledger_index: number;
    date: string;
    Memos: object[];
    AccountName: string;
    DesinationName: string;
    Destination: string;
}