import { Injectable } from "@angular/core";
import { Observable, Subject } from 'rxjs';

@Injectable()
export class LoginService {
    constructor() {
        this.loginSubject = new Subject<boolean>();
        this.showLogin = this.loginSubject.asObservable();
    }

    loginState: boolean = false;
    showLogin: Observable<boolean>;

    private loginSubject: Subject<boolean>;

    toggleLogin(){
        this.loginState = !this.loginState;
        this.loginSubject.next(this.loginState);
    }

    setLogin(state: boolean){
        this.loginState = state;
        this.loginSubject.next(this.loginState);
    }
}