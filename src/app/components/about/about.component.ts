import { OnInit, Component } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.css']
})

export class AboutComponent implements OnInit{
    constructor(private titleService: Title) {
        this.titleService.setTitle("About - The Chain Hunter : Multi Blockchain Search | BTC, ETH, LTC, BCH, XRP, and more!");
    }

    ngOnInit() {}
}