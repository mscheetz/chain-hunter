import { OnInit, Component } from '@angular/core';
import { MessageService, MenuItem } from 'primeng/api';

@Component({
    selector: 'navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css']
})

export class NavigationComponent implements OnInit{
    constructor(private messageSvc: MessageService) {
    }

    items: MenuItem[];

    ngOnInit() {
        this.items = [
            {
                label: 'Home',
                routerLink: '/'
            },
            {
                label: 'Login/Register',
                routerLink: '/login',
                command: (onclick) => {this.login()}
            },
            {
                label: 'About',
                routerLink: '/about'
            }
        ]
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