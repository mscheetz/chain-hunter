import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../classes/user.class';
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
    loginCookie: string = "tch-cookie-login";
    userDetailCookie: string = "tch-cookie-user";

    constructor(private apiSvc: ApiService, private helperSvc: HelperService, private cookieSvc: CookieService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.loggedInSubject = new BehaviorSubject<boolean>(this.loggedInState);
        this.adminSubject = new BehaviorSubject<boolean>(this.adminState);
        this.isLoggedIn = this.loggedInSubject.asObservable();
        this.isAdmin = this.adminSubject.asObservable();
        this.checkLoggedIn();
        this.validateTokenDate();
    }
    loggedInState: boolean = false;
    adminState: boolean = false;
    isLoggedIn: Observable<boolean>;
    isAdmin: Observable<boolean>;

    private loggedInSubject: BehaviorSubject<boolean>;
    private adminSubject: BehaviorSubject<boolean>;

    private checkLoggedIn() {
        const cookies = this.cookieSvc.getAll();
        const loggedInCookie = this.cookieSvc.get(this.loginCookie);
        if(typeof loggedInCookie !== "undefined" && loggedInCookie !== null && loggedInCookie !== "") {
            const userCookie = this.cookieSvc.get(this.userDetailCookie);
            if(typeof userCookie !== "undefined" && userCookie !== null && userCookie !== "") {
                const user = JSON.parse(userCookie);
                this.updateUserDetails(user);
                this.setLoginSubject(true);
            } else {
                this.setLoginSubject(false);
                this.setAdminSubject(false);
            }
        } else {
            this.setLoginSubject(false);
            this.setAdminSubject(false);
        }
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    public getLoggedInStatus(): Observable<boolean> {
        return this.loggedInSubject.asObservable();
    }

    public getAdminStatus(): Observable<boolean> {
        return this.adminSubject.asObservable();
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
                
                this.addLogin(jwt);

                this.setLoginSubject(true);
                return res;
            }));
    }

    private setLoginSubject(state: boolean) {
        this.loggedInState = state;
        this.loggedInSubject.next(state);
    }

    private setAdminSubject(status: boolean) {
        this.adminState = status;
        this.adminSubject.next(status);
    }

    logout() {
        this.removeLogin();
        this.removeUser();
        this.cookieSvc.delete(this.unlimitedCookie);
        this.cookieSvc.delete(this.searchLimitCookie);
        this.setLoginSubject(false);
        this.setAdminSubject(false);
        this.currentUserSubject.next(null);
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
        user.emailSubscription = userResponse.emailSubscription;
        user.message = userResponse.message;
        user.savedHunts = userResponse.savedHunts;
        user.saveLimit = userResponse.saveLimit;
        user.searchLimit = userResponse.searchLimit;
        user.userId = userResponse.userId;
        user.username = userResponse.username;
        user.validated = userResponse.validated;
        user.adFree = userResponse.adFree;
        if(userResponse.searchLimit === null) {
            this.cookieSvc.set(this.unlimitedCookie, 'unlimited', 1);
        } else {
            this.cookieSvc.set(this.searchLimitCookie, JSON.stringify(userResponse.searchLimit), 1);
        }
        if(userResponse.expirationDate !== null) {
            user.expirationDateFormat = this.helperSvc.unixToUTC(user.expirationDate, false);
        }

        this.user = user;
        this.currentUserSubject.next(user);
        this.addUser(user);
        let adminStatus = +user.accountTypeId === 4;
        this.setAdminSubject(adminStatus);
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

    private dataSetter(user: User, jwt?: string) {
        if(jwt) {
            this.addLogin(jwt);
        }
        this.addUser(user);
    }

    private addLogin(jwt: string) {
        this.removeLogin();
        this.cookieSvc.set(this.loginCookie, jwt, 2, "/");
        const cookies = this.cookieSvc.getAll();
        localStorage.setItem(environment.jwtTsName, this.helperSvc.getFutureUnixTimestamp(1, Interval.Day).toString());
        localStorage.setItem(environment.jwtName, jwt);
    }

    private addUser(user: User) {
        this.removeUser();
        this.cookieSvc.set(this.userDetailCookie, JSON.stringify(user), 2, "/");
        const cookies = this.cookieSvc.getAll();
        localStorage.setItem(environment.currentUserName, JSON.stringify(user));
    }

    private removeLogin() {
        this.cookieSvc.delete(this.loginCookie, "/");
        localStorage.removeItem(environment.jwtTsName);
        localStorage.removeItem(environment.jwtName);
    }

    private removeUser() {
        this.cookieSvc.delete(this.userDetailCookie, "/");
        localStorage.removeItem(environment.currentUserName);
    }
}