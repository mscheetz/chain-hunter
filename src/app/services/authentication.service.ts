import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../classes/User';
import { ApiService } from './api-svc.service';

@Injectable({providedIn: 'root'})
export class AuthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private apiSvc: ApiService) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    login(email: string, password: string) {
        return this.apiSvc.login(email, password)
        .pipe(map(res => {
                const jwt = res.token;
                localStorage.setItem('tch-user-token', JSON.stringify(jwt));
                const user = new User();
                user.accountType = res.accountType;
                user.createdDate = res.createdDate;
                user.email = res.email;
                user.expirationDate = res.expirationDate;
                user.userId = res.userId;
                user.username = res.username;
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return res;
            }));
    }

    logout() {
        localStorage.removeItem('tch-user-token');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }
}