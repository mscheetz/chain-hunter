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

@Injectable({providedIn: 'root'})
export class XrpService{
    constructor(private http: HttpClient) {}

    conn: Connections = new Connections();
    base: string = this.conn.xrpBase;

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