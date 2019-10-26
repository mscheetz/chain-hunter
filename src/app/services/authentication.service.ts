import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../classes/User';
import { ApiService } from './api-svc.service';
import { HelperService } from './helper-svc.service';
import { Interval } from '../classes/Enums';
import { environment } from 'src/environments/environment.prod';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;
    user: User;

    constructor(private apiSvc: ApiService, private helperSvc: HelperService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
        this.validateTokenDate();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    getUser(): User{
        return this.user;
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

                this.user = user;
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
        return localStorage.getItem(environment.jwtName) ? true : false;
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