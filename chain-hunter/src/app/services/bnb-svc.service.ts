import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { BnbAddress } from '../classes/BNB/BnbAddress';
import { BnbAddressTxnResponse } from '../classes/BNB/BnbAddressTxnResponse';
import { BnbTransaction } from '../classes/BNB/BnbTransaction';

@Injectable({providedIn: 'root'})
export class BnbService {
    constructor(private http: HttpClient) {}

    conn: Connections = new Connections();
    base: string = this.conn.bnbBase;

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
        let endpoint: string = "/transactions?address=" + address;
        let url: string = this.base + endpoint;

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