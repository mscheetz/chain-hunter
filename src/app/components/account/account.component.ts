import { OnInit, Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
    selector: 'account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.css']
})

export class AccountComponent implements OnInit{
    //@Output() login: EventEmitter<any> = new EventEmitter();
    @Input() showLogin: boolean;
    
    constructor() {
    }

    ngOnInit() {        
    }

    onLogin() {
        this.showLogin = true;
        //this.login.emit();
    }
}