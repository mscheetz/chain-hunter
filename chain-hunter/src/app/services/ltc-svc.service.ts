import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { LtcTransaction } from '../classes/LTC/LtcTransaction';

@Injectable({providedIn: 'root'})
export class LtcService{
    constructor(private http: HttpClient) {}

    conn: Connections = new Connections();
    base: string = this.conn.chainzBase;
    key: string = "&key=" + this.conn.chainzExplorerKey;

    /**
     * Get a LTC address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<number>{
        let endpoint: string = "/ltc/";
        let params: string = "?q=getbalance&a=" + address;
        let url: string = this.base + endpoint + params + this.key;

        let result = this.http.get<number>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for a LTC Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<LtcTransaction[]>{
        let endpoint: string = "/ltc/";
        let params: string = "?q=getbalance&a=" + address;
        let url: string = this.base + endpoint + params + this.key;

        return this.http.get<LtcTransaction[]>(url)
        .pipe(delay(1000));
    }

    /**
     * Get a LTC transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<LtcTransaction>{
        let endpoint: string = "/ltc/";
        let params: string = "?q=txinfo&t=" + transaction;
        let url: string = this.base + endpoint + params + this.key;

        return this.http.get<LtcTransaction>(url)
        .pipe(delay(1000));
    }
}