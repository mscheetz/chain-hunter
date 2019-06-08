export class EosReceipt {
    constructor() {}

    receiver: string;
    act_digest: string;
    global_sequence: number;
    recv_sequence: number;
    auth_sequence: Map<string, string>;    
    code_sequence: number;
    abi_sequence: number;
}