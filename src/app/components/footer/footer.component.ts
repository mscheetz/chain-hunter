import { Component, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'footer-component',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})

export class FooterComponent implements OnInit {
    @Output() login: EventEmitter<any> = new EventEmitter();
    
    constructor() {}

    ngOnInit() {}

    onLogin() {
        this.login.emit();
    }
}