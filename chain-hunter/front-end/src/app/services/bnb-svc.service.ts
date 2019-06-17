import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { BnbAddress } from '../classes/BNB/BnbAddress';
import { BnbAddressTxnResponse } from '../classes/BNB/BnbAddressTxnResponse';
import { BnbTransaction } from '../classes/BNB/BnbTransaction';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { Address } from '../classes/ChainHunter/Address';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { BnbBalance } from '../classes/BNB/BnbBalance';
import { Asset } from '../classes/ChainHunter/Asset';
import { HelperService } from './helper-svc.service';
import { BnbAddressTransaction } from '../classes/BNB/BnbAddressTransaction';

@Injectable({providedIn: 'root'})
export class BnbService {
    constructor(private http: HttpClient, private helperSvc: HelperService) {}

    conn: Connections = new Connections();
    base: string = this.conn.bnbBase;
    base2: string = this.conn.bnbBase2;

    /**
     * Get a BNB Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'Binance Coin';
        chain.symbol = 'BNB';
        chain.hasTokens = true;

        return chain;
    }

    /**
     * Convert BnbAddress to generic Address
     * 
     * @param bnbAddress BnbAddress object
     */
    addressConvert(bnbAddress: BnbAddress): Address {
        let address: Address = null;

        if(bnbAddress != null) {
            let qty = 0;
            bnbAddress.balances.forEach(balance => {
                if(balance.symbol === "BNB") {
                    qty = +balance.free + +balance.frozen + +balance.locked;
                }
            })

            address = new Address();
            address.address = bnbAddress.address;
            address.quantity = qty;
            address.tokens = this.tokenConvert(bnbAddress.balances);
        }

        return address;
    }
    
    /**
     * Convert BNB token array to Asset array
     * 
     * @param tokens BnbBalance collection to convert
     */
    tokenConvert(tokens: BnbBalance[]): Asset[] {
        let assets: Asset[] = [];

        tokens.forEach(token => {
            let asset = new Asset();
            let quantity = +token.free + +token.frozen + +token.locked;
            asset.quantity = this.helperSvc.commaBigNumber(quantity.toString());
            asset.symbol = token.symbol;

            assets.push(asset);
        });

        return assets;
    }

    /**
     * Convert BnbAddressTransaction collection to collection of generic Transactions
     * 
     * @param bnbTransactions BnbAddressTransaction to convert
     */
    transactionsConvert(bnbTransactions: BnbAddressTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(bnbTransactions != null && bnbTransactions.length > 0) {
            bnbTransactions.slice(0, 10).forEach(txn => {
                let transaction = this.addressTransactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    /**
     * Convert a BnbAddressTransaction to a generic Transaction
     * 
     * @param bnbTransaction BnbAddressTransaction to convert
     */
    addressTransactionConvert(bnbTransaction: BnbAddressTransaction): Transaction {
        let txn: Transaction = null;

        if(bnbTransaction != null) {
            txn = new Transaction();
            txn.hash = bnbTransaction.txHash;
            txn.block = bnbTransaction.blockHeight;
            txn.quantity = bnbTransaction.value;
            txn.confirmations = bnbTransaction.confirmBlocks;
            txn.date = this.helperSvc.unixToUTC(bnbTransaction.timeStamp);
            txn.from = bnbTransaction.fromAddr;
            txn.to = bnbTransaction.toAddr;
        }

        return txn;
    }

    /**
     * Convert a BnbTransaction to a generic Transaction
     * 
     * @param bnbTransaction BnbTransaction to convert
     */
    transactionConvert(bnbTransaction: BnbTransaction): Transaction {
        let txn: Transaction = null;

        if(bnbTransaction != null) {
            let from = "";
            let to = ""
            bnbTransaction.tx.value.inputs.forEach(input => {
                if(from !== "") {
                    from += ", ";
                } 
                from += input.address;
            });
            bnbTransaction.tx.value.outputs.forEach(output => {
                if(to !== "") {
                    to += ", ";
                } 
                to += output.address;
            });
            txn = new Transaction();
            txn.hash = bnbTransaction.hash;
            txn.block = parseInt(bnbTransaction.height);
            txn.quantity = bnbTransaction.tx.value.inputs[0].coins[0].amount;
            //txn.confirmations = xrpTransaction.confirmations;
            //txn.date = bnbTransaction.date;
            txn.from = from;
            txn.to = to;
        }

        return txn;
    }

    /**
     * Get a BNB address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<BnbAddress>{
        let endpoint: string = "/account/" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<BnbAddress>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for a BNB Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<BnbAddressTxnResponse>{
        let endpoint: string = "/txs?page=1&rows=10&address=" + address;
        let url: string = this.base2 + endpoint;

        return this.http.get<BnbAddressTxnResponse>(url)
        .pipe(delay(1000));
    }

    /**
     * Get a BNB transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<BnbTransaction>{
        let endpoint: string = "/tx/" + transaction + "?format=json";
        let url: string = this.base + endpoint;

        return this.http.get<BnbTransaction>(url)
        .pipe(delay(1000));
    }
}