import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { Asset } from '../classes/ChainHunter/Asset';

@Injectable({providedIn: 'root'})
export class ServerService{
    constructor(private http: HttpClient) {}
    
    /**
     * Get a Blockchain
     * 
     * @param chain Blockchain to query
     * @param addyTxn Address/Transaction hash to query
     */
    getBlockchain(chain: string, addyTxn: string): Observable<Map<string, Blockchain>>{
        let endpoint: string = "/api/blockchain/"+ chain + "/" + addyTxn;

        let result = this.http.get<Map<string, Blockchain>>(endpoint);
    
        return result;
    }

    
    /**
     * Get all Blockchains
     * 
     * @param addyTxn Address/Transaction hash to query
     */
    getBlockchains(addyTxn: string): Observable<Map<string, Blockchain>>{
        let endpoint: string = "/api/blockchain" + addyTxn;

        let result = this.http.get<Map<string, Blockchain>>(endpoint);
    
        return result;
    }

    /**
     * Get Transactions for an Address
     * 
     * @param chain Blockchain to query
     * @param address Address to query
     */
    getAddressTransactions(chain: string, address: string): Observable<Transaction[]>{
        let endpoint: string = "/api/address/" + chain + "/" + address +"/tx";

        return this.http.get<Transaction[]>(endpoint);
    }

    /**
     * Get Address tokens
     * 
     * @param chain Blockchain to query
     * @param address Address to query
     */
    getAddressTokens(chain: string, address: string): Observable<Asset[]>{
        let endpoint: string = "/api/address/" + chain + "/" + address +"/tokens";

        return this.http.get<Asset[]>(endpoint);
    }
}