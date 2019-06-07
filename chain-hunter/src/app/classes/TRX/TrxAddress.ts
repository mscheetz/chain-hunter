import { TrxAddress20Token } from './TrxAddress20Token';
import { TrxAddressBandwidth } from './TrxAddressBandwidth';
import { TrxAddress10Token } from './TrxAddress10Token';

export class TrxAddress {
    constructor() {}

    trc20token_balances: TrxAddress20Token[];
    allowExchange: object[];
    address: string;
    frozen_supply: object[];
    bandwidth: TrxAddressBandwidth;
    accountType: number;
    exchanges: object[];
    frozen: object;
    accountResource: object;
    tokenBalances: TrxAddress10Token[];
    balance: number;
    voteTotal: number;
    name: string;
    delegated: object;
    totalTransactionCount: number;
    representative: object;
    activePermissions: object[];
}