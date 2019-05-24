import { XrpTakerPay } from './XrpTakerPay';
import { XrpTakerGet } from './XrpTakerGet';
import { XrpTransactionAmount } from './XrpTransactionAmount';

export class XrpTransaction {
    constructor() {}

    public TakerPays: XrpTakerPay;
    public TakerGets: XrpTakerGet;
    public meta: object;
    public Paths: object[];
    public Amount: XrpTransactionAmount;
    public Account: string;
    public Expiration: number;
    public Fee: number;
    public Flags: number;
    public LastLedgerSequence: number;
    public OfferSequence: number;
    public Sequence: number;
    public SigningPubKey: string;
    public TransactionType: string;
    public TxnSignature: string;
    public hash: string;
    public ledger_index: number;
    public date: string;
    public Memos: object[];
    public AccountName: string;
    public DesinationName: string;
}