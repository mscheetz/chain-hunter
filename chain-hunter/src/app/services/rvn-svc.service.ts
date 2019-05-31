import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { RvnAddress } from '../classes/RVN/RvnAddress';
import { RvnTransaction } from '../classes/RVN/RvnTransaction';
import { RvnPaged } from '../classes/RVN/RvnPaged';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { Address } from '../classes/ChainHunter/Address';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { HelperService } from './helper-svc.service';

@Injectable({providedIn: 'root'})
export class RvnService{
    constructor(private http: HttpClient, private helperSvc: HelperService) {}

    conn: Connections = new Connections();
    base: string = this.conn.rvnBase;

    /**
     * Get a RVN Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'Raven Coin';
        chain.symbol = 'RVN';

        return chain;
    }

    /**
     * Convert RvnAddress to generic Address
     * 
     * @param rvnAddress RvnAddress object
     */
    addressConvert(rvnAddress: RvnAddress): Address {
        let address: Address = null;

        if(rvnAddress != null) {
            address = new Address();
            address.address = rvnAddress.addrStr;
            address.quantity = rvnAddress.balance/100000000;
        }

        return address;
    }

    /**
     * Convert RvnTransaction collection to collection of generic Transactions
     * 
     * @param rvnTransactions RvnTransaction to convert
     */
    transactionsConvert(rvnTransactions: RvnTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(rvnTransactions != null && rvnTransactions.length > 0) {
            rvnTransactions.slice(0, 10).forEach(txn => {
                let transaction = this.transactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    /**
     * Convert a RvnTransaction to a generic Transaction
     * 
     * @param rvnTransaction RvnTransaction to convert
     */
    transactionConvert(rvnTransaction: RvnTransaction): Transaction {
        let txn: Transaction = null;

        if(rvnTransaction != null) {
            let from = "";
            let to = ""
            rvnTransaction.vin.forEach(vin => {
                if(from !== "") {
                    from += ", ";
                } 
                from += vin.addr;
            });
            rvnTransaction.vout.forEach(vout => {
                if(to !== "") {
                    to += ", ";
                } 
                to += vout.scriptPubKey.addresses.join(", ");
            });
            txn = new Transaction();
            txn.hash = rvnTransaction.txid;
            txn.block = rvnTransaction.blockheight;
            txn.quantity = rvnTransaction.valueOut/100000000;
            txn.confirmations = rvnTransaction.confirmations;
            txn.date = this.helperSvc.unixToUTC(rvnTransaction.blocktime);
            txn.from = from;
            txn.to = to;
        }

        return txn;
    }

    /**
     * Get a RVN address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<RvnAddress>{
        let endpoint: string = "/addr/" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<RvnAddress>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for a RVN Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string, page: number = 0): Observable<RvnPaged<RvnTransaction[]>>{
        let endpoint: string = "/txs?address=" + address +"&pageNum=" + page;
        let url: string = this.base + endpoint;

        return this.http.get<RvnPaged<RvnTransaction[]>>(url)
        .pipe(delay(1000));
    }

    /**
     * Get a RVN transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<RvnTransaction>{
        let endpoint: string = "/tx/" + transaction;
        let url: string = this.base + endpoint;

        return this.http.get<RvnTransaction>(url)
        .pipe(delay(1000));
    }
}