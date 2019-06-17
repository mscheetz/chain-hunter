import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { Asset } from '../classes/ChainHunter/Asset';

@Injectable({providedIn: 'root'})
export class ChainHunterService{
    constructor(private http: HttpClient) {}
    
    private baseUrl: string = "http://localhost:4200";


    /**
     * Get empty Blockchains
     * 
     * @param chain Blockchain to query
     * @param addyTxn Address/Transaction hash to query
     */
    getEmptyBlockchains(): Observable<Map<string, Blockchain>>{
        let endpoint: string = "/api/blockchain/empty";
        let url: string = this.baseUrl + endpoint;

        let result = this.http.get<Map<string, Blockchain>>(url);
    
        return result;
    }

    /**
     * Get a Blockchain
     * 
     * @param chain Blockchain to query
     * @param addyTxn Address/Transaction hash to query
     */
    getBlockchain(chain: string, addyTxn: string): Observable<Blockchain>{
        let endpoint: string = "/api/blockchain/"+ chain + "/" + addyTxn;
        let url: string = this.baseUrl + endpoint;

        let result = this.http.get<Blockchain>(url);
    
        return result;
    }

    
    /**
     * Get all Blockchains
     * 
     * @param addyTxn Address/Transaction hash to query
     */
    getBlockchains(addyTxn: string): Observable<Map<string, Blockchain>>{
        let endpoint: string = "/api/blockchain/" + addyTxn;
        let url: string = this.baseUrl + endpoint;

        let result = this.http.get<Map<string, Blockchain>>(url);
    
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
        let url: string = this.baseUrl + endpoint;

        return this.http.get<Transaction[]>(url);
    }

    /**
     * Get Address tokens
     * 
     * @param chain Blockchain to query
     * @param address Address to query
     */
    getAddressTokens(chain: string, address: string): Observable<Asset[]>{
        let endpoint: string = "/api/address/" + chain + "/" + address +"/tokens";
        let url: string = this.baseUrl + endpoint;

        return this.http.get<Asset[]>(url);
    }
}