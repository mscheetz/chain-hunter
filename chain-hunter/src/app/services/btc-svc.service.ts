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
import { copyAnimationEvent } from '@angular/animations/browser/src/render/shared';
import { HelperService } from './helper-svc.service';

@Injectable({providedIn: 'root'})
export class BtcService{
    constructor(private http: HttpClient, private helperSvc: HelperService) {}
    conn: Connections = new Connections();
    base: string = this.conn.btcBase;

    /**
     * Get a BTC Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'Bitcoin';
        chain.symbol = 'BTC';

        return chain;
    }

    /**
     * Convert BtcAddress to generic Address
     * 
     * @param btcAddress BtcAddress object
     */
    addressConvert(btcAddress: BtcAddress): Address {
        let address: Address = null;

        if(btcAddress != null) {
            address = new Address();
            address.address = btcAddress.address;
            address.quantity = btcAddress.balance/100000000;
        }

        return address;
    }

    /**
     * Convert BtcTransaction collection to collection of generic Transactions
     * 
     * @param btcTransactions BtcTransactions to convert
     */
    transactionsConvert(btcTransactions: BtcTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(btcTransactions != null && btcTransactions.length > 0) {
            btcTransactions.slice(0, 10).forEach(txn => {
                let transaction = this.transactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    /**
     * Convert a BtcTransaction to a generic Transaction
     * 
     * @param btcTransaction BtcTransaction to convert
     */
    transactionConvert(btcTransaction: BtcTransaction): Transaction {
        let txn: Transaction = null;

        if(btcTransaction != null) {
            txn = new Transaction();
            txn.hash = btcTransaction.hash;
            txn.block = btcTransaction.block_height;
            txn.quantity = btcTransaction.outputs_value/100000000;
            txn.confirmations = btcTransaction.confirmations;
            txn.date = this.helperSvc.unixToUTC(btcTransaction.created_at);
            txn.from = btcTransaction.inputs[0].prev_addresses[0];
            txn.to = btcTransaction.outputs[0].addresses[0];
        }

        return txn;
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
