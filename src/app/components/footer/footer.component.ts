import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'footer-component',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.css']
})

export class FooterComponent implements OnInit {
    showQRCode: boolean = false;
    donateType: string;
    qrType: string = "url";
    address: string = "36ZZ78NYGtvhQCcSRRG7311MoxZDJkCzob";
    symbol: string = null;
    @Output() toggleLogin: EventEmitter<any> = new EventEmitter();
    @Input() loggedIn: boolean;
    @Output() notification: EventEmitter<any> = new EventEmitter();
    
    constructor() {}

    ngOnInit() {}

    /**
     * Login to app
     */
    onLogin() {
        this.toggleLogin.emit(event);
        //this.login.emit();
    }

    /**
     * Get QR Code for selected blockchain address
     * 
     * @param symbol blockchain symbol
     */
    getQrCode(symbol: string) {
        this.symbol = symbol;
        if(this.symbol === "BTC") {
            this.address = environment.btc;
        } else if(this.symbol === "ETH") {
            this.address = environment.eth;
        } else if(this.symbol === "NANO") {
            this.address = environment.nano;
        } else if(this.symbol === "RVN") {
            this.address = environment.rvn;
        }
        this.donateType = "Donate with " + this.symbol + "!";
        this.showQRCode = true;
    }

    /**
     * Copy address to the clipboard
     */
    copyAddress() {
        document.addEventListener('copy', (e: ClipboardEvent) => {
            e.clipboardData.setData('text/plain', (this.address));
            e.preventDefault();
            document.removeEventListener('copy', null);
        });
        document.execCommand('copy');

        let message = this.symbol + " address copied to clipboard";

        this.notification.emit(message);
        this.showQRCode = false;
    }
}