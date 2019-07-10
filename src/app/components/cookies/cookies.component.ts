import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Message } from 'primeng/components/common/api';

@Component({
    selector: 'cookies',
    templateUrl: './cookies.component.html',
    styleUrls: ['./cookies.component.css']
})

export class CookiesComponent implements OnInit {
    msgs: Message[] = [];
    @Output() cookiesOk: EventEmitter<any> = new EventEmitter();
    constructor() {}
    
    ngOnInit() {
        this.msgs = [];
        // this.msgs.push({
        //     severity: "info", 
        //     summary: "Cookie Notice", 
        //     detail: "Chain Hunter uses cookies for the following purposes: analysis of web traffic and displaying targeted advertisements. By using Chain Hunter you consent to the use of our cookies."});
    }

    cookieOk(){
        this.cookiesOk.emit();
    }
}