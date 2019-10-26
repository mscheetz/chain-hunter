import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../classes/User';
import { ApiService } from './api-svc.service';
import { HelperService } from './helper-svc.service';
import { Interval } from '../classes/Enums';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private apiSvc: ApiService, private helperSvc: HelperService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.validateTokenDate();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        return this.apiSvc.login(email, password)
        .pipe(map(res => {
                const jwt = res.token;
                let user = new User();
                user.accountType = res.accountType;
                user.createdDate = res.createdDate;
                user.email = res.email;
                user.expirationDate = res.expirationDate;
                user.userId = res.userId;
                user.username = res.username;

                this.addLogin(jwt, user);
                this.currentUserSubject.next(user);
                return res;
            }));
    }

    logout() {
        this.removeLogin();
        this.currentUserSubject.next(null);
    }

    isLoggedIn() {
        return localStorage.getItem('tch-user-token') ? true : false;
    }

    private validateTokenDate() {
        let expiry = localStorage.getItem('tch-user-token-expiry');
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
        localStorage.setItem('tch-user-token-expiry', this.helperSvc.getFutureUnixTimestamp(1, Interval.Day).toString());
        localStorage.setItem('tch-user-token', jwt);
        localStorage.setItem('currentUser', JSON.stringify(user));
    }

    private removeLogin() {
        localStorage.removeItem('tch-user-token-expiry');
        localStorage.removeItem('tch-user-token');
        localStorage.removeItem('currentUser');
    }
}