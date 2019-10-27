import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Blockchain } from '../classes/ChainHunter/Blockchain';
import { Transaction } from '../classes/ChainHunter/Transaction';
import { Asset } from '../classes/ChainHunter/Asset';
import { Chain } from '../classes/ChainHunter/Chain';
import { environment } from 'src/environments/environment';
import { HelperService } from './helper-svc.service';
import { User } from '../classes/User';
import { UserData } from '../classes/UserData';
import { UserResponse } from '../classes/UserResponse';
import { ResultType } from '../classes/Enums';

@Injectable({providedIn: 'root'})
export class ApiService{
    constructor(private http: HttpClient, private helperSvc: HelperService) {}
    
    private baseUrl: string = "";
    private user: string = environment.user;

    /**
     * User login
     * @param email email address
     * @param password password
     */
    login(email: string, password: string): Observable<UserResponse> {
        let endpoint: string = "/api/user/login";
        let url: string = this.baseUrl + endpoint;

        let result = this.onPost<UserResponse>(url, { email, password });

        return result;
    }

    /**
     * Guest login
     */
    guest(): Observable<UserResponse> {
        let endpoint: string = "/api/user/guest";
        let url: string = this.baseUrl + endpoint;

        let result = this.onPost<UserResponse>(url, null);

        return result;
    }

    /**
     * Forgot a password
     * @param email email address
     */
    forgotPassword(email: string): Observable<number> {
        let endpoint: string = "/api/user/forgotPassword";
        let url: string = this.baseUrl + endpoint;

        let result = this.onPost<number>(url, { email });

        return result;
    }

    /**
     * Change a password
     * @param user user data 
     * @param oldPassword old password
     * @param newPassword new password
     */
    changePassword(user: User, oldPassword: string, newPassword: string): Observable<User> {
        let endpoint: string = "/api/user/password";
        let url: string = this.baseUrl + endpoint;

        let result = this.onPost<User>(url, { user, oldPassword, newPassword }, true);

        return result;
    }

    /**
     * Register a new user
     * @param user user data to register
     */
    register(user: User): Observable<number> {
        let endpoint: string = "/api/user";
        let url: string = this.baseUrl + endpoint;

        let result = this.onPost<number>(url, user);

        return result;
    }

    /**
     * Update user data
     * @param user user data to update
     */
    updateUser(user: User): Observable<number> {
        let endpoint: string = "/api/user";
        let url: string = this.baseUrl + endpoint;

        let result = this.onPut<number>(url, user, true);

        return result;
    }

    /**
     * Get saved search history
     * 
     * @param userId user id
     */
    getUserData(): Observable<UserData[]> {
        let endpoint: string = "/api/user/data";
        let url: string = this.baseUrl + endpoint;

        let result = this.onGet<UserData[]>(url, true);

        return result;
    }

    /**
     * Save user search data
     * 
     * @param hash hash to save
     * @param symbol symbol
     * @param type type of object
     */
    saveData(hash: string, symbol: string, type: ResultType): Observable<number> {
        let endpoint: string = "/api/user/data";
        let url: string = this.baseUrl + endpoint;
        let data = {
            hash: hash,
            symbol: symbol,
            type: ResultType[type]
        }

        let result = this.onPost<number>(url, data, true);

        return result;
    }

    /**
     * Delete user search data
     * 
     * @param id save id
     */
    deleteData(id: string): Observable<number> {
        let endpoint: string = "/api/user/data";
        let url: string = this.baseUrl + endpoint + "/" + id;

        let result = this.onDelete<number>(url, true);

        return result;
    }

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
        let endpoint: string = "/api/blockchain/address/" + chain + "/" + address +"/txs";
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
        let endpoint: string = "/api/blockchain/address/" + chain + "/" + address +"/tokens";
        let url: string = this.baseUrl + endpoint;

        return this.onGet<Asset[]>(url);
    }

    /**
     * Capture an empty search
     */
    emptySearch(): Observable<boolean>{
        let endpoint: string = "/api/blockchain/empty";
        let url: string = this.baseUrl + endpoint;

        return this.onGet<boolean>(url);
    }

    /**
     * Get an address
     * @param chain blockchain symbol
     * @param address address
     */
    getAddress(chain: string, address: string): Observable<Blockchain>{
        let endpoint: string = "/api/blockchain/address/"+ chain + "/" + address;
        let url: string = this.baseUrl + endpoint;

        let result = this.onGet<Blockchain>(url);
    
        return result;
    }

    /**
     * Get a contract
     * @param chain blockchain symbol
     * @param address address
     */
    getContract(chain: string, address: string): Observable<Blockchain>{
        let endpoint: string = "/api/blockchain/contract/"+ chain + "/" + address;
        let url: string = this.baseUrl + endpoint;

        let result = this.onGet<Blockchain>(url);
    
        return result;
    }

    /**
     * Get a transaction
     * @param chain blockchain symbol
     * @param hash transaction hash
     */
    getTransaction(chain: string, hash: string): Observable<Blockchain>{
        let endpoint: string = "/api/blockchain/txn/"+ chain + "/" + hash;
        let url: string = this.baseUrl + endpoint;

        let result = this.onGet<Blockchain>(url);
    
        return result;
    }

    onGet<T>(url: string, secure: boolean = false): Observable<T> {
        let headers = this.getHeaders(secure);
        let requestOptions = {
            headers: new HttpHeaders(headers),
        }

        return this.http.get<T>(url, requestOptions);
    }

    onPost<T>(url: string, data: any, secure: boolean = false): Observable<T> {
        let headers = this.getHeaders(secure);
        let requestOptions = {
            headers: new HttpHeaders(headers),
        }

        return this.http.post<T>(url, data, requestOptions);
    }

    onPut<T>(url: string, data: any, secure: boolean = false): Observable<T> {
        let headers = this.getHeaders(secure);
        let requestOptions = {
            headers: new HttpHeaders(headers),
        }

        return this.http.put<T>(url, data, requestOptions);
    }

    onDelete<T>(url: string, secure: boolean = false): Observable<T> {
        let headers = this.getHeaders(secure);
        let requestOptions = {
            headers: new HttpHeaders(headers),
        }

        return this.http.delete<T>(url, requestOptions);
    }

    getHeaders(secure: boolean = false) {        
        let headers = {
            'TCH-USER': this.user,
            'TCH-SIGNATURE': this.helperSvc.requestSignature()
        }

        if(secure){
            headers['x-access-token'] = localStorage.getItem("tch-user-token");
        }

        return headers;
    }
}
