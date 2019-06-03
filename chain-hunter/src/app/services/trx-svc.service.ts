import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { Address } from '../classes/ChainHunter/Address';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { HelperService } from './helper-svc.service';
import { TrxToken20Response } from '../classes/TRX/TrxToken20Response';
import { TrxToken10Response } from '../classes/TRX/TrxToken10Response';
import { TrxAddress } from '../classes/TRX/TrxAddress';
import { TrxResponse } from '../classes/TRX/TrxResponse';
import { TrxContract } from '../classes/TRX/TrxContract';
import { TrxTransaction } from '../classes/TRX/TrxTransaction';
import { TrxAddressTransactionResponse } from '../classes/TRX/TrxAddressTransactionResponse';
import { TrxBlock } from '../classes/TRX/TrxBlock';
import { TrxToken20 } from '../classes/TRX/TrxToken20';
import { TrxToken10 } from '../classes/TRX/TrxToken10';
import { Asset } from '../classes/ChainHunter/Asset';

@Injectable({providedIn: 'root'})
export class TrxService{
    constructor(private http: HttpClient, private helperSvc: HelperService) {}

    conn: Connections = new Connections();
    base: string = this.conn.trxBase;
    trx10: TrxToken10[] = null;
    trx20: TrxToken20[] = null;

    /**
     * Get a TRX Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'Tron';
        chain.symbol = 'TRX';
        //chain.hasTokens = true;

        return chain;
    }

    /**
     * Convert TrxAddress to generic Address
     * 
     * @param trxAddress TrxAddress object
     */
    addressConvert(trxAddress: TrxAddress): Address {
        let address: Address = null;

        if(trxAddress != null) {
            address = new Address();
            address.address = trxAddress.address;
            address.quantity = trxAddress.balance/100000000;
        }

        return address;
    }

    tokenConvert(trxAddress: TrxAddress): Asset[] {
        let assets: Asset[] = [];

        trxAddress.trc20token_balances.forEach(token => {
            let asset = new Asset();
            asset.symbol = token.symbol;
            asset.quantity = token.balance.toString();
            assets.push(asset);
        })

        trxAddress.tokenBalances.forEach(token => {
            let asset = new Asset();
            asset.quantity = token.balance.toString();
            let trx10 = this.trx10.find(t => t.tokenID === parseInt(token.symbol))
            asset.symbol = trx10.abbr;
            assets.push(asset);
        })

        return assets;
    }

    /**
     * Convert TrxContract to generic Address
     * 
     * @param trxContract TrxContract object
     */
    contractConvert(trxContract: TrxContract): Address {
        let address: Address = null;

        if(trxContract != null) {
            address = new Address();
            address.address = trxContract.address;
            address.quantity = trxContract.balance/100000000;
        }

        return address;
    }

    /**
     * Convert TrxTransaction collection to collection of generic Transactions
     * 
     * @param trxTransactions TrxTransaction to convert
     */
    transactionsConvert(trxTransactions: TrxTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(trxTransactions != null && trxTransactions.length > 0) {
            trxTransactions.slice(0, 10).forEach(txn => {
                let transaction = this.transactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    /**
     * Convert a TrxTransaction to a generic Transaction
     * 
     * @param trxTransaction TrxTransaction to convert
     */
    transactionConvert(trxTransaction: TrxTransaction): Transaction {
        let txn: Transaction = null;

        if(trxTransaction != null) {
            txn = new Transaction();
            txn.hash = trxTransaction.hash;
            txn.block = trxTransaction.block;
            txn.quantity = trxTransaction.contractData.amount;
            txn.confirmations = -1;
            //txn.confirmations = (trxTransaction.latest_block - trxTransaction.block);
            txn.date = this.helperSvc.unixToUTC(trxTransaction.timestamp);
            txn.from = trxTransaction.ownerAddress;
            txn.to = trxTransaction.toAddress;
        }

        return txn;
    }
    
    /**
     * Get a TRX address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<TrxAddress>{
        let endpoint: string = "/account?address=" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<TrxAddress>(url)
        .pipe(delay(1000));
    
        return result;
    }
    
    /**
     * Get a TRX contract
     * 
     * @param address Address to check
     */
    getContract(address: string): Observable<TrxResponse<TrxContract>>{
        let endpoint: string = "/contract?contract=" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<TrxResponse<TrxContract>>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for a TRX Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<TrxAddressTransactionResponse>{
        let endpoint: string = "/transaction?sort=-timestamp&count=true&limit=10&start=0&address=" + address;
        let url: string = this.base + endpoint;

        return this.http.get<TrxAddressTransactionResponse>(url)
        .pipe(delay(1000));
    }

    /**
     * Get a TRX transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<TrxTransaction>{
        let endpoint: string = "/transaction-info?hash=" + transaction;
        let url: string = this.base + endpoint;

        return this.http.get<TrxTransaction>(url)
        .pipe(delay(1000));
    }

    /**
     * Get the latest TRX block
     */
    getLatestBlock(): Observable<TrxBlock>{
        let endpoint: string = "/block/latest";
        let url: string = this.base + endpoint;

        return this.http.get<TrxBlock>(url)
        .pipe(delay(1000));
    }

    /**
     * Get Trx10 Tokens
     * 
     * @param page Page number
     */
    getTrx10Tokens(page: number): Observable<TrxToken10Response>{
        let start = page == 1 ? 0 : (page * 200) + 1;
        let endpoint: string = "/token?sort=-name&limit=200&start="+ start +"&totalAll=1&status=ico";
        let url: string = this.base + endpoint;

        return this.http.get<TrxToken10Response>(url)
        .pipe(delay(1000));
    }

    /**
     * Set TRX10 tokens
     * 
     * @param tokens Tokens to set
     */
    setTrx10s(tokens: TrxToken10[]) {
        this.trx10 = tokens;
    }

    /**
     * Get TRX10 tokens
     */
    getTrx10s(): TrxToken10[] {
        return this.trx10;
    }

    /**
     * Get Trx20 Tokens
     * 
     * @param page Page number
     */
    getTrx20Tokens(page: number): Observable<TrxToken20Response>{
        let start = page == 1 ? 0 : (page * 200) + 1;
        let endpoint: string = "/token_trc20?limit=200&start=" + start;
        let url: string = this.base + endpoint;

        return this.http.get<TrxToken20Response>(url)
        .pipe(delay(1000));
    }

    /**
     * Set TRX20 tokens
     * 
     * @param tokens Tokens to set
     */
    setTrx20s(tokens: TrxToken20[]) {
        this.trx20 = tokens;
    }

    /**
     * Get TRX20 tokens
     */
    getTrx20s(): TrxToken20[] {
        return this.trx20;
    }

    /**
     * Check if TRX tokens are needed
     */
    tokensNeeded(): boolean {
        if(this.trx10 === null || this.trx20 === null) {
            return true;
        }
        return false;
    }
}