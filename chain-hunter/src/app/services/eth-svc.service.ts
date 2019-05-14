import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { BtcAddress } from '../classes/BTC/BtcAddress';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BtcTransaction } from '../classes/BTC/BtcTransaction';
import { Injectable } from '@angular/core';
import { BtcBase } from '../classes/BTC/BtcBase';
import { BtcPage } from '../classes/BTC/BtcPage';
import { delay } from 'rxjs/operators';
import { EthResponse } from '../classes/ETH/EthResponse';
import { EthTransaction } from '../classes/ETH/EthTransaction';
import { EthplorerHeader } from '../classes/ETH/EthPlorerHeader';
import { EthplorerToken } from '../classes/ETH/EthplorerToken';

@Injectable({providedIn: 'root'})
export class EthService{
    constructor(private http: HttpClient) {}

    conn: Connections = new Connections();
    ethscanBase: string = this.conn.ethscanBase;
    ethscanApiKey: string = "&apikey=" + this.conn.ethscanKey;
    ethplorerBase: string = this.conn.ethplorerBase;
    ethplorerApiKey: string = "?apiKey=" + this.conn.ethplorerKey;

    /**
     * Get an ETH address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<EthResponse<number>>{
        let endpoint: string = "?module=account&action=balance&address="+ address +"&tag=latest";
        let url: string = this.ethscanBase + endpoint + this.ethscanApiKey;

        let result = this.http.get<EthResponse<number>>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for an Eth Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<EthResponse<EthResponse<EthTransaction[]>>>{
        let endpoint: string = "module=account&action=txlist&address=" + address + "&startblock=0&endblock=99999999&sort=asc";
        let url: string = this.ethscanBase + endpoint + this.ethscanApiKey;

        return this.http.get<EthResponse<EthResponse<EthTransaction[]>>>(url)
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
        let endpoint: string = "module=proxy&action=eth_blockNumber";
        let url: string = this.ethscanBase + endpoint + this.ethscanApiKey;

        return this.http.get<EthResponse<string>>(url)
        .pipe(delay(1000));

    }
}