import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { LtcTransaction } from '../classes/LTC/LtcTransaction';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { LtcAddress } from '../classes/LTC/LtcAddress';
import { Address } from '../classes/ChainHunter/Address';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { HelperService } from './helper-svc.service';
import { LtcPagedTransactions } from '../classes/LTC/LtcPagedTransactions';

@Injectable({providedIn: 'root'})
export class LtcService{
    constructor(private http: HttpClient, private helperSvc: HelperService) {}

    conn: Connections = new Connections();
    base: string = this.conn.ltcBase;

    /**
     * Get a LTC Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'Litecoin';
        chain.symbol = 'LTC';

        return chain;
    }

    /**
     * Convert LtcAddress to generic Address
     * 
     * @param ltcAddress LtcAddress object
     */
    addressConvert(ltcAddress: LtcAddress): Address {
        let address: Address = null;

        if(ltcAddress != null) {
            address = new Address();
            address.address = ltcAddress.address;
            address.quantity = ltcAddress.balance;
        }

        return address;
    }

    /**
     * Convert LtcTransaction collection to collection of generic Transactions
     * 
     * @param ltcTransactions LtcTransaction to convert
     */
    transactionsConvert(ltcTransactions: LtcTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(ltcTransactions != null && ltcTransactions.length > 0) {
            ltcTransactions.slice(0, 10).forEach(txn => {
                let transaction = this.transactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    /**
     * Convert a LtcTransaction to a generic Transaction
     * 
     * @param ltcTransaction LtcTransaction to convert
     */
    transactionConvert(ltcTransaction: LtcTransaction): Transaction {
        let txn: Transaction = null;

        if(ltcTransaction != null) {
            let qty = ltcTransaction.valueOut;
            let from = "";
            let to = ""
            ltcTransaction.vin.forEach(vin => {
                if(from !== "") {
                    from += ", ";
                } 
                from += vin.addr;
            });
            ltcTransaction.vout.forEach(vout => {
                if(from !== "") {
                    from += ", ";
                } 
                from += vout.scriptPubKey.addresses.join(", ");
            });

            txn = new Transaction();
            txn.hash = ltcTransaction.txid;
            txn.block = ltcTransaction.blockheight;
            txn.quantity = ltcTransaction.valueOut;
            txn.confirmations = ltcTransaction.confirmations;
            txn.date = this.helperSvc.unixToUTC(ltcTransaction.time);
            txn.from = from;
            txn.to = to;
        }

        return txn;
    }

    /**
     * Get a LTC address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<LtcAddress>{
        let endpoint: string = "/addr/" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<LtcAddress>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for a LTC Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<LtcPagedTransactions>{
        let endpoint: string = "/txs?address=" + address;
        let url: string = this.base + endpoint;

        return this.http.get<LtcPagedTransactions>(url)
        .pipe(delay(1000));
    }

    /**
     * Get a LTC transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<LtcTransaction>{
        let endpoint: string = "/tx/" + transaction;
        let url: string = this.base + endpoint;

        return this.http.get<LtcTransaction>(url)
        .pipe(delay(1000));
    }
}