import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { Asset } from '../classes/ChainHunter/Asset';
import { Chain } from '../classes/ChainHunter/Chain';
import { environment } from 'src/environments/environment';
import { HelperService } from './helper-svc.service';

@Injectable({providedIn: 'root'})
export class ChainHunterService{
    constructor(private http: HttpClient, private helperSvc: HelperService) {}
    
    private baseUrl: string = "";
    private user: string = environment.user;

    /**
     * Get active blockchains
     */
    getActiveChains(): Observable<Chain[]> {
        let endpoint: string = "/api/blockchain/active";
        let url: string = this.baseUrl + endpoint;

        let result = this.onGet<Chain[]>(url);
    
        return result;
    }

    /**
     * Get future blockchains
     */
    getFutureChains(): Observable<Chain[]> {
        let endpoint: string = "/api/blockchain/future";
        let url: string = this.baseUrl + endpoint;

        let result = this.onGet<Chain[]>(url);
    
        return result;
    }

    /**
     * Get empty Blockchains
     * 
     * @param chain Blockchain to query
     * @param addyTxn Address/Transaction hash to query
     */
    getEmptyBlockchains(): Observable<Map<string, Blockchain>>{
        let endpoint: string = "/api/blockchain/empty";
        let url: string = this.baseUrl + endpoint;

        let result = this.onGet<Map<string, Blockchain>>(url);
    
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

        let result = this.onGet<Blockchain>(url);
    
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

        let result = this.onGet<Map<string, Blockchain>>(url);
    
        return result;
    }

    /**
     * Get Transactions for an Address
     * 
     * @param chain Blockchain to query
     * @param address Address to query
     */
    getAddressTransactions(chain: string, address: string): Observable<Transaction[]>{
        let endpoint: string = "/api/address/" + chain + "/" + address +"/txs";
        let url: string = this.baseUrl + endpoint;

        return this.onGet<Transaction[]>(url);
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

        return this.onGet<Asset[]>(url);
    }

    /**
     * Capture an empty search
     */
    emptySearch(): Observable<boolean>{
        let endpoint: string = "/api/empty";
        let url: string = this.baseUrl + endpoint;

        return this.onGet<boolean>(url);
    }

    onGet<T>(url: string): Observable<T> {
        let headers = {
            'TCH-USER': this.user,
            'TCH-SIGNATURE': this.helperSvc.requestSignature()
        }
        let requestOptions = {
            headers: new HttpHeaders(headers),
        }

        return this.http.get<T>(url, requestOptions);
    }
}
