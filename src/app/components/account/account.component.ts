import { OnInit, Component } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'account',
    templateUrl: './account.component.html',
    styleUrls: ['./account.component.css']
})

export class AccountComponent implements OnInit{    
    constructor(private messageSvc: MessageService) {
    }

    ngOnInit() {        
    }

    login() {
        this.messageSvc.add(
            {
                key:'login-notice-toast',
                severity:'info', 
                summary:'Coming Soon', 
                detail:'Account registrations coming soon. Follow us on twitter to be the first to sign up!',
                sticky: true
            });
    }
}