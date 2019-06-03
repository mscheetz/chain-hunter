import { TrxAddressAsset } from './TrxAddressAsset';

export class TrxAddressBandwidth {
    constructor() {}

    energyRemaining: number;
    totalEnergyLimit: number;
    totalEnergyWeight: number;
    netUsed: number;
    storageLimit: number;
    storagePercentage: number;
    assets: Map<string, TrxAddressAsset>;
    netPercentage: number;
    storageUsed: number;
    storageRemaining: number;
    freeNetLimit: number;
    energyUsed: number;
    freeNetRemaining: number;
    netLimit: number;
    netRemaining: number;
    energyLimit: number;
    freeNetUsed: number;
    totalNetWeight: number;
    freeNetPercentage: number;
    energyPercentage: number;
    totalNetLimit: number;
}