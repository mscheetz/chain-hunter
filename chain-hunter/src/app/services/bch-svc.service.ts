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

@Injectable({providedIn: 'root'})
export class BchService{
    constructor(private http: HttpClient) {}

    conn: Connections = new Connections();
    base: string = this.conn.bchBase;

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