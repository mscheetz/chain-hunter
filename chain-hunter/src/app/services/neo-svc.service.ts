import { Connections } from '../classes/Connections';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { delay } from 'rxjs/operators';
import { NeoAddress } from '../classes/NEO/NeoAddress';
import { NeoPaged } from '../classes/NEO/NeoPaged';
import { NeoTransaction } from '../classes/NEO/NeoTransaction';

@Injectable({providedIn: 'root'})
export class NeoService{
    constructor(private http: HttpClient) {}

    conn: Connections = new Connections();
    base: string = this.conn.neoBase;

    /**
     * Get a NEO address
     * 
     * @param address Address to check
     */
    getAddress(address: string): Observable<NeoAddress>{
        let endpoint: string = "/v1/get_balance/" + address;
        let url: string = this.base + endpoint;

        let result = this.http.get<NeoAddress>(url)
        .pipe(delay(1000));
    
        return result;
    }

    /**
     * Get Transactions for a NEO Address
     * 
     * @param address Address to check
     */
    getAddressTransactions(address: string): Observable<NeoPaged>{
        let endpoint: string = "/v1/get_address_abstracts/" + address +"/1";
        let url: string = this.base + endpoint;

        return this.http.get<NeoPaged>(url)
        .pipe(delay(1000));
    }

    /**
     * Get a NEO transaction
     * 
     * @param transaction Transaction to check
     */
    getTransaction(transaction: string): Observable<NeoTransaction>{
        let endpoint: string = "/v1/get_transaction/" + transaction + "?verbose=3";
        let url: string = this.base + endpoint;

        return this.http.get<NeoTransaction>(url)
        .pipe(delay(1000));
    }
}