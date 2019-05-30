import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { BchBase } from '../classes/BCH/BchBase';
import { BchAddress } from '../classes/BCH/BchAddress';
import { BchTransaction } from '../classes/BCH/BchTransaction';
import { BchPagedResponse } from '../classes/BCH/BchPagedResponse';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { Address } from '../classes/ChainHunter/Address';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { DateService } from './date-svc.service';

@Injectable({providedIn: 'root'})
export class BchService{
    constructor(private http: HttpClient, private dateSvc: DateService) {}

    conn: Connections = new Connections();
    base: string = this.conn.bchBase;

    /**
     * Get a BCH Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'Bitcoin Cash';
        chain.symbol = 'BCH';

        return chain;
    }

    /**
     * Convert BchAddress to generic Address
     * 
     * @param bchAddress BchAddress object
     */
    addressConvert(bchAddress: BchAddress): Address {
        let address: Address = null;

        if(bchAddress != null) {
            address = new Address();
            address.address = bchAddress.address;
            address.quantity = bchAddress.balance/100000000;
        }

        return address;
    }

    /**
     * Convert BchTransaction collection to collection of generic Transactions
     * 
     * @param bchTransactions BchTransaction to convert
     */
    transactionsConvert(bchTransactions: BchTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(bchTransactions != null && bchTransactions.length > 0) {
            bchTransactions.slice(0, 10).forEach(txn => {
                let transaction = this.transactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    /**
     * Convert a BchTransaction to a generic Transaction
     * 
     * @param bchTransaction BchTransaction to convert
     */
    transactionConvert(bchTransaction: BchTransaction): Transaction {
        let txn: Transaction = null;

        if(bchTransaction != null) {
            txn = new Transaction();
            txn.hash = bchTransaction.hash;
            txn.block = bchTransaction.block_height;
            txn.quantity = bchTransaction.outputs_value/100000000;
            txn.confirmations = bchTransaction.confirmations;
            txn.date = this.dateSvc.unixToUTC(bchTransaction.created_at);
            txn.from = bchTransaction.inputs[0].prev_addresses[0];
            txn.to = bchTransaction.outputs[0].addresses[0];
        }

        return txn;
    }
    
    /**
     * Get a BCH address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<BchBase<BchAddress>>{
        let endpoint: string = "/address/" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<BchBase<BchAddress>>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for a BCH Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<BchBase<BchPagedResponse<BchTransaction[]>>>{
        let endpoint: string = "/address/" + address +"/tx";
        let url: string = this.base + endpoint;

        return this.http.get<BchBase<BchPagedResponse<BchTransaction[]>>>(url)
        .pipe(delay(1000));
    }

    /**
     * Get a BCH transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<BchBase<BchTransaction>>{
        let endpoint: string = "/tx/" + transaction + "?verbose=3";
        let url: string = this.base + endpoint;

        return this.http.get<BchBase<BchTransaction>>(url)
        .pipe(delay(1000));
    }
}