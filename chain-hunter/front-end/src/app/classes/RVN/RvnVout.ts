import { RvnScriptPubKey } from './RvnScriptPubKey';

export class RvnVout {
    constructor() {}

    public value: string;
    public n: number;
    public scriptPubKey: RvnScriptPubKey;
    public spentTxId: string;
    public spentIndex: number;
    public spentHeight: number;
}