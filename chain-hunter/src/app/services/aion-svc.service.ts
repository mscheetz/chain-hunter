import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { Address } from '../classes/ChainHunter/Address';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { HelperService } from './helper-svc.service';
import { AionAddress } from '../classes/AION/AionAddress';
import { AionResponse } from '../classes/AION/AionResponse';
import { Asset } from '../classes/ChainHunter/Asset';
import { AionTokenDetail } from '../classes/AION/AionTokenDetail';
import { AionPagedResponse } from '../classes/AION/AionPagedResponse';
import { AionTransaction } from '../classes/AION/AionTransaction';
import { AionBlock } from '../classes/AION/AionBlock';

@Injectable({providedIn: 'root'})
export class AionService{
    constructor(private http: HttpClient, private helperSvc: HelperService) {}

    conn: Connections = new Connections();
    base: string = this.conn.aionBase;

    /**
     * Get a AION Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'AION';
        chain.symbol = 'AION';
        chain.hasTokens = true;

        return chain;
    }

    /**
     * Convert AionAddress to generic Address
     * 
     * @param aionAddress AionAddress object
     */
    addressConvert(aionAddress: AionAddress): Address {
        let address: Address = null;

        if(aionAddress != null) {
            address = new Address();
            address.address = aionAddress.address;
            address.quantity = aionAddress.balance;
        }

        return address;
    }

    tokensConvert(aionDetails: AionTokenDetail[]): Asset[] {
        let assets: Asset[] = [];

        aionDetails.forEach(detail => {
            assets.push(this.tokenConvert(detail));
        });

        return assets;
    }

    tokenConvert(aionAddress: AionTokenDetail): Asset {
        let asset = new Asset();
        asset.quantity = this.helperSvc.commaBigNumber(aionAddress.balance.toString());
        asset.symbol = aionAddress.tokenSymbol;

        return asset;
    }

    /**
     * Convert AionTransaction collection to collection of generic Transactions
     * 
     * @param aionTransactions AionTransaction to convert
     */
    transactionsConvert(aionTransactions: AionTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(aionTransactions != null && aionTransactions.length > 0) {
            aionTransactions.slice(0, 10).forEach(txn => {
                let transaction = this.transactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    /**
     * Convert a AionTransaction to a generic Transaction
     * 
     * @param aionTransaction AionTransaction to convert
     */
    transactionConvert(aionTransaction: AionTransaction): Transaction {
        let txn: Transaction = null;

        if(aionTransaction != null) {
            txn = new Transaction();
            txn.hash = "0x" + aionTransaction.transactionHash;
            txn.block = aionTransaction.blockNumber;
            txn.quantity = aionTransaction.value;
            //txn.confirmations = aionTransaction.confirmations;
            let ts = aionTransaction.transactionTimestamp.toString().substr(0, 10);
            txn.date = this.helperSvc.unixToUTC(parseInt(ts));
            txn.from = aionTransaction.fromAddr;
            txn.to = aionTransaction.toAddr;
        }

        return txn;
    }
    
    /**
     * Get latest AION block
     */
    getLatestBlock(): Observable<AionPagedResponse<AionBlock[]>> {
        let endpoint: string = "/getBlockList?page=0&size=1";
        let url: string = this.base + endpoint;

        let result = this.http.get<AionPagedResponse<AionBlock[]>>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get an AION address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<AionResponse<AionAddress[]>>{
        let endpoint: string = "/getAccountDetails?accountAddress=" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<AionResponse<AionAddress[]>>(url)
        .pipe(delay(1000));
    
        return result;
    }
    
    /**
     * Get an AION token details
     * 
     * @param address Address to check
     * @param tokenAddress Token address to check
     */
    getTokens(address: string, tokenAddress: string): Observable<AionResponse<AionTokenDetail[]>>{
        let endpoint: string = "/getAccountDetails?accountAddress=" + address + "&tokenAddress=" + tokenAddress;
        let url: string = this.base + endpoint;

        let result = this.http.get<AionResponse<AionTokenDetail[]>>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for an AION Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<AionPagedResponse<AionTransaction[]>>{
        let endpoint: string = "/getTransactionsByAddress?accountAddress="+ address +"&page=0&size=10";
        let url: string = this.base + endpoint;

        return this.http.get<AionPagedResponse<AionTransaction[]>>(url)
        .pipe(delay(1000));
    }

    /**
     * Get an AION transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<AionResponse<AionTransaction>>{
        transaction = transaction.substr(0, 2) === "0x" ? transaction.substr(2) : transaction;
        let endpoint: string = "/getTransactionDetailsByTransactionHash?searchParam=" + transaction;
        let url: string = this.base + endpoint;

        return this.http.get<AionResponse<AionTransaction>>(url)
        .pipe(delay(1000));
    }
}