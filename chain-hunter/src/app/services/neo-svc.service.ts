import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { NeoAddress } from '../classes/NEO/NeoAddress';
import { NeoPaged } from '../classes/NEO/NeoPaged';
import { NeoTransaction } from '../classes/NEO/NeoTransaction';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { Address } from '../classes/ChainHunter/Address';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { HelperService } from './helper-svc.service';
import { NeoAsset } from '../classes/NEO/NeoAsset';
import { Asset } from '../classes/ChainHunter/Asset';

@Injectable({providedIn: 'root'})
export class NeoService{
    constructor(private http: HttpClient, private helperSvc: HelperService) {}

    conn: Connections = new Connections();
    base: string = this.conn.neoBase;

    /**
     * Get a NEO Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'Neo';
        chain.symbol = 'NEO';

        return chain;
    }

    /**
     * Convert NeoAddress to generic Address
     * 
     * @param neoAddress NeoAddress object
     */
    addressConvert(neoAddress: NeoAddress): Address {
        let address: Address = null;

        if(neoAddress != null) {
            address = new Address();
            address.address = neoAddress.address;
            let qty = 0;
            neoAddress.balance.forEach(bal => {
                if(bal.asset_symbol === "NEO") {
                    qty = bal.amount;
                }
            })
            address.quantity = qty;
            address.tokens = this.tokenConvert(neoAddress.balance);
        }

        return address;
    }
    
    /**
     * Convert NEO token array to Asset array
     * 
     * @param tokens NeoAsset collection to convert
     */
    tokenConvert(tokens: NeoAsset[]): Asset[] {
        let assets: Asset[] = [];

        tokens.forEach(token => {
            let asset = new Asset();
            let quantity = this.helperSvc.exponentialToNumber(token.amount);
            quantity = quantity.toString();
            asset.quantity = this.helperSvc.commaBigNumber(quantity);
            asset.symbol = token.asset_symbol;

            assets.push(asset);
        });

        return assets;
    }

    /**
     * Convert NeoTransaction collection to collection of generic Transactions
     * 
     * @param neoTransactions NeoTransaction to convert
     */
    transactionsConvert(neoTransactions: NeoTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(neoTransactions != null && neoTransactions.length > 0) {
            neoTransactions.slice(0, 10).forEach(txn => {
                let transaction = this.transactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    /**
     * Convert a NeoTransaction to a generic Transaction
     * 
     * @param neoTransaction NeoTransaction to convert
     */
    transactionConvert(neoTransaction: NeoTransaction): Transaction {
        let txn: Transaction = null;

        if(neoTransaction != null) {
            let qty = neoTransaction.size;
            let from = "";
            let to = ""
            neoTransaction.vin.forEach(vin => {
                if(from !== "") {
                    from += ", ";
                } 
                from += vin.address_hash;
            });
            neoTransaction.vouts.forEach(vout => {
                if(from !== "") {
                    from += ", ";
                } 
                from += vout.address_hash;
            });

            txn = new Transaction();
            txn.hash = neoTransaction.txid;
            txn.block = neoTransaction.block_height;
            txn.quantity = neoTransaction.size;
            txn.confirmations = neoTransaction.block_height;
            txn.date = this.helperSvc.unixToUTC(neoTransaction.time);
            txn.from = from;
            txn.to = to;
        }

        return txn;
    }
    
    /**
     * Get a NEO address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<NeoAddress>{
        let endpoint: string = "/v1/get_balance/" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<NeoAddress>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for a NEO Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<NeoPaged>{
        let endpoint: string = "/v1/get_address_abstracts/" + address +"/1";
        let url: string = this.base + endpoint;

        return this.http.get<NeoPaged>(url)
        .pipe(delay(1000));
    }

    /**
     * Get a NEO transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<NeoTransaction>{
        let endpoint: string = "/v1/get_transaction/" + transaction + "?verbose=3";
        let url: string = this.base + endpoint;

        return this.http.get<NeoTransaction>(url)
        .pipe(delay(1000));
    }
}