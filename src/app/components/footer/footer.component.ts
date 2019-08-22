import { Component, OnInit, Output, EventEmitter } from '@angular/core';

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

    @Output() login: EventEmitter<any> = new EventEmitter();
    @Output() notification: EventEmitter<any> = new EventEmitter();
    
    constructor() {}

    ngOnInit() {}

    /**
     * Login to app
     */
    onLogin() {
        this.login.emit();
    }

    /**
     * Get QR Code for selected blockchain address
     * 
     * @param symbol blockchain symbol
     */
    getQrCode(symbol: string) {
        this.symbol = symbol;
        if(this.symbol === "BTC") {
            this.address = "36ZZ78NYGtvhQCcSRRG7311MoxZDJkCzob";
        } else if(this.symbol === "ETH") {
            this.address = "0x996C94D629037027dA38d5Ae94B24DC3f29B5030";
        } else if(this.symbol === "NANO") {
            this.address = "nano_15ai3x9tenfiu7md74baxtdg94sqjjuz9kqxzo1o81usjzphrhxx4ukxp4an";
        } else if(this.symbol === "RVN") {
            this.address = "RBmSaX6SADW6MLmU7j3d5BNM6aGrGnnCXQ";
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