import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { RvnAddress } from '../classes/RVN/RvnAddress';
import { RvnTransaction } from '../classes/RVN/RvnTransaction';
import { RvnPaged } from '../classes/RVN/RvnPaged';

@Injectable({providedIn: 'root'})
export class RvnService{
    constructor(private http: HttpClient) {}

    conn: Connections = new Connections();
    base: string = this.conn.rvnBase;

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