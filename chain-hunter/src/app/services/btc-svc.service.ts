import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { BtcAddress } from '../classes/BTC/BtcAddress';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BtcTransaction } from '../classes/BTC/BtcTransaction';
import { Injectable } from '@angular/core';
import { BtcBase } from '../classes/BTC/BtcBase';
import { BtcPage } from '../classes/BTC/BtcPage';
import { delay } from 'rxjs/operators';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { Address } from '../classes/ChainHunter/Address';
import { Transaction } from '../classes/ChainHunter/Transaction';

@Injectable({providedIn: 'root'})
export class BtcService{
    constructor(private http: HttpClient) {}

    btcAddress: BtcAddress = null;
    btcTransaction: BtcTransaction = null;
    btcTransactions: BtcTransaction[] = [];
    btcComplete = false;
    conn: Connections = new Connections();
    base: string = this.conn.btcBase;

    get(addyTxn: string): Blockchain {
        let chain = new Blockchain();
        chain.name = 'Bitcoin';
        chain.symbol = 'BTC';

        this.onGetAddress(addyTxn);
        if(this.btcComplete) {
            this.onGetTransactions(addyTxn);
        } else {
            this.onGetTransaction(addyTxn);
        }

        chain.address = this.addressConvert(this.btcAddress);
        chain.transaction = this.transactionConvert(this.btcTransaction);
        chain.found = chain.address || chain.transaction ? true : false;
        return chain;
    } 
    
    addressConvert(btcAddress: BtcAddress): Address {
        let address: Address = null;

        if(btcAddress != null) {
            address = new Address();
            address.address = btcAddress.address;
            address.quantity = btcAddress.balance/100000000;
        }

        return address;
    }

    transactionsConvert(btcTransactions: BtcTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(this.btcTransactions != null && this.btcTransactions.length > 0) {
            this.btcTransactions.forEach(txn => {
                let transaction = this.transactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    transactionConvert(transaction: BtcTransaction): Transaction {
        let txn: Transaction = null;

        if(transaction != null) {
            txn = new Transaction();
            txn.hash = transaction.hash;
            txn.block = transaction.block_height;
            txn.quantity = transaction.outputs_value/100000000;
            txn.confirmations = transaction.confirmations;
            txn.date = new Date(transaction.created_at).toString();
            txn.from = transaction.inputs[0].prev_addresses[0];
            txn.to = transaction.outputs[0].addresses[0];
        }

        return txn;
    }

    onGetAddress(address: string) {
        this.getAddress(address)
            .subscribe(response => {
                if(response.err_no === 0 && response.data !== null) {
                    this.btcAddress = response.data
                    this.btcComplete = true;
                    console.log("btc address found");
                } else {
                    console.log("btc address not found");
                }
            },
            error => {
                console.log("btc address error:" + error);
            });
    }

    onGetTransactions(address: string) {
        this.getAddressTransactions(address)
            .subscribe(txns => {
                this.btcTransactions = txns.data.list;
            });
    }

    onGetTransaction(hash: string) {
        this.getTransaction(hash)
            .subscribe(txn => {
                this.btcComplete = true;
                if(txn.err_no === 0) {
                    this.btcTransaction = txn.data
                    this.btcComplete = true;
                    console.log("btc transaction found");
                } else {
                    console.log("btc transaction not found");
                }
            },
            error => {
                this.btcComplete = true;
                console.log("btc transaction error:" + error);
            });

    }

    /**
     * Get a BTC address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<BtcBase<BtcAddress>>{
        let endpoint: string = "/address/" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<BtcBase<BtcAddress>>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for a BTC Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<BtcBase<BtcPage<BtcTransaction[]>>>{
        let endpoint: string = "/address/" + address +"/tx";
        let url: string = this.base + endpoint;

        return this.http.get<BtcBase<BtcPage<BtcTransaction[]>>>(url)
        .pipe(delay(1000));
    }

    /**
     * Get a BTC transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<BtcBase<BtcTransaction>>{
        let endpoint: string = "/tx/" + transaction + "?verbose=3";
        let url: string = this.base + endpoint;

        return this.http.get<BtcBase<BtcTransaction>>(url)
        .pipe(delay(1000));
    }
}
