import { EthplorerPrice } from './EthplorerPrice';

export class EthplorerTokenInfo {
    constructor() {}

    address: string;
    name: string;
    decimals: number;
    symbol: string;
    totalSupply: number;
    owner: string;
    lastUpdated: number;
    issuancesCount: number;
    holdersCount: number;
    ethTransfersCount: number;
    price: EthplorerPrice;
}