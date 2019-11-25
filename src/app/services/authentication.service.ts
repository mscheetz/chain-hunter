import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../classes/User';
import { ApiService } from './api.service';
import { HelperService } from './helper.service';
import { Interval } from '../classes/Enums';
import { environment } from 'src/environments/environment.prod';
import { CookieService } from 'ngx-cookie-service';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    user: User;
    unlimitedCookie: string = "tch-cookie-unlimited";
    searchLimitCookie: string = "tch-cookie-search";

    constructor(private apiSvc: ApiService, private helperSvc: HelperService, private cookieSvc: CookieService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.loggedInSubject = new BehaviorSubject<boolean>(this.loggedInState);
        this.isLoggedIn = this.loggedInSubject.asObservable();
        this.validateTokenDate();
    }
    loggedInState: boolean = false;
    isLoggedIn: Observable<boolean>;

    private loggedInSubject: BehaviorSubject<boolean>;

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public getLoggedInStatus(): Observable<boolean> {
        return this.loggedInSubject.asObservable();
    }

    getUser(): User{
        return this.user;
    }

    dismissUserMessage(): User {
        this.user.message = null;
        return this.user;
    }

    login(email: string, password: string) {
        return this.apiSvc.login(email, password)
        .pipe(map(res => {
                const jwt = res.token;
                this.updateUserDetails(res);
                // let user = new User();
                // user.accountType = res.accountType;
                // user.accountTypeId = res.accountTypeId;
                // user.created = res.created;
                // user.email = res.email;
                // user.expirationDate = res.expirationDate;
                // user.message = res.message;
                // user.savedHunts = res.savedHunts;
                // user.saveLimit = res.saveLimit;
                // user.searchLimit = res.searchLimit;
                // user.userId = res.userId;
                // user.username = res.username;
                // user.validated = res.validated;
                // if(res.searchLimit === null) {
                //   this.cookieSvc.set(this.unlimitedCookie, 'unlimited', 1);
                // } else {
                //   this.cookieSvc.set(this.searchLimitCookie, JSON.stringify(res.searchLimit), 1);
                // }

                // this.user = user;
                this.addLogin(jwt, this.user);
                this.loggedInState = true;
                //this.currentUserSubject.next(this.user);
                this.loggedInSubject.next(true);
                return res;
            }));
    }

    logout() {
        this.removeLogin();
        this.cookieSvc.delete(this.unlimitedCookie);
        this.cookieSvc.delete(this.searchLimitCookie);
        this.loggedInState = false;
        this.currentUserSubject.next(null);
        this.loggedInSubject.next(false);
    }

    async userRefresh() {
        await this.apiSvc.getUser().toPromise()
            .then(res => {
                this.updateUserDetails(res);
            })
    }

    private updateUserDetails(userResponse: User){
        let user = new User();
        user.accountType = userResponse.accountType;
        user.accountTypeId = userResponse.accountTypeId;
        user.created = userResponse.created;
        user.email = userResponse.email;
        user.expirationDate = userResponse.expirationDate;
        user.message = userResponse.message;
        user.savedHunts = userResponse.savedHunts;
        user.saveLimit = userResponse.saveLimit;
        user.searchLimit = userResponse.searchLimit;
        user.userId = userResponse.userId;
        user.username = userResponse.username;
        user.validated = userResponse.validated;
        if(userResponse.searchLimit === null) {
            this.cookieSvc.set(this.unlimitedCookie, 'unlimited', 1);
        } else {
            this.cookieSvc.set(this.searchLimitCookie, JSON.stringify(userResponse.searchLimit), 1);
        }

        this.user = user;
        this.currentUserSubject.next(user);
        localStorage.removeItem(environment.currentUserName);
        localStorage.setItem(environment.currentUserName, JSON.stringify(this.user));
    }

    private validateTokenDate() {
        let expiry = localStorage.getItem(environment.jwtTsName);
        if(expiry) {
            const expiryI = parseInt(expiry);
            const expiryElapsed = this.helperSvc.getTimestampAge(expiryI, Interval.Hour);
            if(expiryElapsed > 24) {
                this.removeLogin();
            }
        }
    }

    private addLogin(jwt: string, user: User) {
        this.removeLogin();
        localStorage.setItem(environment.jwtTsName, this.helperSvc.getFutureUnixTimestamp(1, Interval.Day).toString());
        localStorage.setItem(environment.jwtName, jwt);
        localStorage.setItem(environment.currentUserName, JSON.stringify(user));
    }

    private removeLogin() {
        localStorage.removeItem(environment.jwtTsName);
        localStorage.removeItem(environment.jwtName);
        localStorage.removeItem(environment.currentUserName);
    }
}