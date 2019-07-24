import { OnInit, Component, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.css']
})

export class AccountComponent implements OnInit{
    @Output() login: EventEmitter<any> = new EventEmitter();
    
    constructor() {
    }

    ngOnInit() {        
    }

    onLogin() {
        this.login.emit();
    }
}