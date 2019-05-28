import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { BtcAddress } from '../classes/BTC/BtcAddress';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BtcTransaction } from '../classes/BTC/BtcTransaction';
import { Injectable } from '@angular/core';
import { BtcBase } from '../classes/BTC/BtcBase';
import { BtcPage } from '../classes/BTC/BtcPage';
import { delay } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class BtcService{
    constructor(private http: HttpClient) {}

    conn: Connections = new Connections();
    base: string = this.conn.btcBase;

    get(addyTxn: string): Blockchain {
        let chain = new Blockchain('Bitcoin', 'BTC');

	return chain;
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
