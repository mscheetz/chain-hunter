import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { EthResponse } from '../classes/ETH/EthResponse';
import { EthTransaction } from '../classes/ETH/EthTransaction';
import { EthplorerHeader } from '../classes/ETH/EthPlorerHeader';
import { EthplorerToken } from '../classes/ETH/EthplorerToken';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { EthAddress } from '../classes/ETH/EthAddress';
import { Address } from '../classes/ChainHunter/Address';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { HelperService } from './helper-svc.service';
import { EthBlock } from '../classes/ETH/EthBlock';
import { Asset } from '../classes/ChainHunter/Asset';

@Injectable({providedIn: 'root'})
export class EthService{
    constructor(private http: HttpClient, private helperSvc: HelperService) {}

    conn: Connections = new Connections();
    ethscanBase: string = this.conn.ethscanBase;
    ethscanApiKey: string = "&apikey=" + this.conn.ethscanKey;
    ethplorerBase: string = this.conn.ethplorerBase;
    ethplorerApiKey: string = "?apiKey=" + this.conn.ethplorerKey;

    /**
     * Get a ETH Blockchain
     */
    getBlockchain(): Blockchain {
        let chain = new Blockchain();
        chain.name = 'Ethereum';
        chain.symbol = 'ETH';
        chain.hasTokens = true;

        return chain;
    }

    /**
     * Convert EthAddress to generic Address
     * 
     * @param ethAddress EthAddress object
     */
    addressConvert(ethAddress: EthAddress): Address {
        let address: Address = null;

        if(ethAddress != null) {
            address = new Address();
            address.address = ethAddress.Address;
            address.quantity = ethAddress.getBalance();
        }

        return address;
    }

    /**
     * Convert EthTransaction collection to collection of generic Transactions
     * 
     * @param ethTransactions EthTransaction to convert
     */
    transactionsConvert(ethTransactions: EthTransaction[]): Transaction[]{
        let transactions: Transaction[] = [];
        if(ethTransactions != null && ethTransactions.length > 0) {
            ethTransactions.slice(0, 10).forEach(txn => {
                let transaction = this.transactionConvert(txn);
                transactions.push(transaction);
            });
        }
        return transactions;
    }

    /**
     * Convert a EthTransaction to a generic Transaction
     * 
     * @param ethTransaction EthTransaction to convert
     */
    transactionConvert(ethTransaction: EthTransaction): Transaction {
        let txn: Transaction = null;

        if(ethTransaction != null) {
            let qty = parseInt(ethTransaction.value);
            let latestBlock = parseInt(ethTransaction.currentBlock);
            let nonce = parseInt(ethTransaction.timestamp);

            txn = new Transaction();
            txn.hash = ethTransaction.hash;
            txn.block = parseInt(ethTransaction.blockNumber);
            txn.quantity = qty / 1000000000000000000;
            txn.confirmations = latestBlock - txn.block;
            txn.date = this.helperSvc.unixToUTC(nonce);
            txn.from = ethTransaction.from;
            txn.to = ethTransaction.to;
        }

        return txn;
    }
    
    /**
     * Convert ETH token array to Asset array
     * 
     * @param tokens EthplorerToken collection to convert
     */
    tokenConvert(tokens: EthplorerToken[]): Asset[] {
        let assets: Asset[] = [];

        tokens.forEach(token => {
            let asset = new Asset();
            let quantity = this.helperSvc.exponentialToNumber(token.balance);
            quantity = quantity.toString();
            asset.quantity = this.helperSvc.commaBigNumber(quantity);
            asset.symbol = token.tokenInfo.symbol;

            assets.push(asset);
        });

        return assets;
    }

    /**
     * Get an ETH address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<EthResponse<string>>{
        let endpoint: string = "?module=account&action=balance&address="+ address +"&tag=latest";
        let url: string = this.ethscanBase + endpoint + this.ethscanApiKey;

        let result = this.http.get<EthResponse<string>>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for an Eth Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<EthResponse<EthTransaction[]>>{
        let endpoint: string = "?module=account&action=txlist&address=" + address + "&startblock=0&endblock=99999999&page=1&offset=10&sort=desc";
        let url: string = this.ethscanBase + endpoint + this.ethscanApiKey;

        return this.http.get<EthResponse<EthTransaction[]>>(url)
        .pipe(delay(1000));
    }

    /**
     * Get an Eth transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<EthResponse<EthTransaction>>{
        let endpoint: string = "?module=proxy&action=eth_getTransactionByHash&txhash=" + transaction;
        let url: string = this.ethscanBase + endpoint + this.ethscanApiKey;

        return this.http.get<EthResponse<EthTransaction>>(url)
        .pipe(delay(1000));
    }

    /**
     * Get tokens for an address
     * @param address Address to check
     */
    getTokens(address: string): Observable<EthplorerHeader<EthplorerToken[]>>{
        let endpoint: string = "/getAddressInfo/" + address;
        let url: string = this.ethplorerBase + endpoint + this.ethplorerApiKey;

        return this.http.get<EthplorerHeader<EthplorerToken[]>>(url)
        .pipe(delay(1000));
    }

    /**
     * Get lastest Eth block
     */
    getLatestBlock(): Observable<EthResponse<string>> {
        let endpoint: string = "?module=proxy&action=eth_blockNumber";
        let url: string = this.ethscanBase + endpoint + this.ethscanApiKey;

        return this.http.get<EthResponse<string>>(url);
        //.pipe(delay(1000));
    }

    /**
     * Get Block information
     * 
     * @param block block to find
     */
    getBlock(block: number): Observable<EthResponse<EthBlock>> {
        let hexBlock = block.toString(16);
        let endpoint: string = "?module=proxy&action=eth_getBlockByNumber&tag="+ hexBlock + "&boolean=true";
        let url: string = this.ethscanBase + endpoint + this.ethscanApiKey;

        return this.http.get<EthResponse<EthBlock>>(url);
        //.pipe(delay(1000));

    }
}