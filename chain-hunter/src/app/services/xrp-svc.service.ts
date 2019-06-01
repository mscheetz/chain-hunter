import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BtcTransaction } from '../classes/BTC/BtcTransaction';
import { Injectable } from '@angular/core';
import { BtcBase } from '../classes/BTC/BtcBase';
import { delay } from 'rxjs/operators';
import { BchBase } from '../classes/BCH/BchBase';
import { BchAddress } from '../classes/BCH/BchAddress';
import { BchTransaction } from '../classes/BCH/BchTransaction';
import { BchPagedResponse } from '../classes/BCH/BchPagedResponse';
import { XrpAddress } from '../classes/XRP/XrpAddress';
import { XrpTransaction } from '../classes/XRP/XrpTransaction';
import { XrpPaymentsResult } from '../classes/XRP/XrpPaymentsResult';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { Address } from '../classes/ChainHunter/Address';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { XrpAddressTransaction } from '../classes/XRP/XrpAddressTransaction';

@Injectable({providedIn: 'root'})
export class XrpService{
    constructor(private http: HttpClient) {}

    conn: Connections = new Connections();
    base: string = this.conn.xrpBase;

    /**
     * Get a XRP Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'Ripple';
        chain.symbol = 'XRP';

        return chain;
    }

    /**
     * Convert XrpAddress to generic Address
     * 
     * @param xrpAddress XrpAddress object
     */
    addressConvert(xrpAddress: XrpAddress): Address {
        let address: Address = null;

        if(xrpAddress != null) {
            address = new Address();
            address.address = xrpAddress.account;
            address.quantity = parseFloat(xrpAddress.xrpBalance);
        }

        return address;
    }

    /**
     * Convert XrpAddressTransaction collection to collection of generic Transactions
     * 
     * @param xrpTransactions XrpAddressTransaction to convert
     */
    transactionsConvert(xrpTransactions: XrpAddressTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(xrpTransactions != null && xrpTransactions.length > 0) {
            xrpTransactions.slice(0, 10).forEach(txn => {
                let transaction = this.addressTransactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    /**
     * Convert a XrpAddressTransaction to a generic Transaction
     * 
     * @param xrpTransaction XrpAddressTransaction to convert
     */
    addressTransactionConvert(xrpTransaction: XrpAddressTransaction): Transaction {
        let txn: Transaction = null;

        if(xrpTransaction != null) {
            txn = new Transaction();
            txn.hash = xrpTransaction.tx_hash;
            txn.block = xrpTransaction.ledger_index;
            txn.quantity = parseInt(xrpTransaction.delivered_amount);
            //txn.confirmations = xrpTransaction.confirmations;
            txn.date = xrpTransaction.executed_time;
            txn.from = xrpTransaction.source;
            txn.to = xrpTransaction.destination;
        }

        return txn;
    }

    /**
     * Convert a XrpTransaction to a generic Transaction
     * 
     * @param xrpTransaction XrpTransaction to convert
     */
    transactionConvert(xrpTransaction: XrpTransaction): Transaction {
        let txn: Transaction = null;

        if(xrpTransaction != null) {
            txn = new Transaction();
            txn.hash = xrpTransaction.hash;
            txn.block = xrpTransaction.ledger_index;
            txn.quantity = xrpTransaction.Amount.value;
            //txn.confirmations = xrpTransaction.confirmations;
            txn.date = xrpTransaction.date;
            txn.from = xrpTransaction.Account;
            txn.to = xrpTransaction.DesinationName;
        }

        return txn;
    }
    
    /**
     * Get a XRP address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<XrpAddress>{
        let endpoint: string = "/v1/account/" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<XrpAddress>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for a XRP Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<XrpPaymentsResult>{
        let endpoint: string = "/v1/account/" + address +"/payments";
        let url: string = this.base + endpoint;

        return this.http.get<XrpPaymentsResult>(url)
        .pipe(delay(1000));
    }

    /**
     * Get a XRP transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<XrpTransaction>{
        let endpoint: string = "/v1/tx/" + transaction;
        let url: string = this.base + endpoint;

        return this.http.get<XrpTransaction>(url)
        .pipe(delay(1000));
    }
}