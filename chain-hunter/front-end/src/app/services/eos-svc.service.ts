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
import { HelperService } from './helper-svc.service';
import { EosAddress } from '../classes/EOS/EosAddress';
import { EosTransactionsResponse } from '../classes/EOS/EosTransactionsResponse';

@Injectable({providedIn: 'root'})
export class EosService{
    constructor(private http: HttpClient, private helperSvc: HelperService) {}

    conn: Connections = new Connections();
    base: string = this.conn.eosBase;

    /**
     * Get an EOS Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'EOS.IO';
        chain.symbol = 'EOS';

        return chain;
    }

    /**
     * Convert EosAddress to generic Address
     * 
     * @param eosAddress EosAddress object
     */
    addressConvert(eosAddress: EosAddress): Address {
        let address: Address = null;

        if(eosAddress != null) {
            address = new Address();
            address.address = eosAddress.address;
            address.quantity = eosAddress.balance;
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
            txn.date = this.helperSvc.unixToUTC(bchTransaction.created_at);
            txn.from = bchTransaction.inputs[0].prev_addresses[0];
            txn.to = bchTransaction.outputs[0].addresses[0];
        }

        return txn;
    }
    
    /**
     * Get an EOS address balance
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<string[]>{
        let endpoint: string = "/chain/get_currency_balance";
        let url: string = this.base + endpoint;
        let data: string = '{"code":"eosio.token","account":"'+ address +'","symbol":"EOS"}';

        let result = this.http.post<string[]>(url, data)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for an EOS Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<EosTransactionsResponse>{
        let endpoint: string = "/history/get_actions";
        let url: string = this.base + endpoint;
        let data: string = '{"pos":"-1","offset":"-10","account_name":"'+ address +'"}';

        return this.http.post<EosTransactionsResponse>(url, data)
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