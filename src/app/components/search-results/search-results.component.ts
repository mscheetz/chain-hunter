import { OnInit, Input, Component, Output, EventEmitter } from '@angular/core';
import { Blockchain } from 'src/app/classes/ChainHunter/Blockchain';
import { Chain } from 'src/app/classes/ChainHunter/Chain';
import anime from 'animejs';

@Component({
    selector: 'search-results',
    templateUrl: './search-results.component.html',
    styleUrls: ['./search-results.component.css']
})

export class SearchResultsComponent implements OnInit{
    @Input() activeChains: Chain[];
    @Input() blockchain: Blockchain;
    @Input() transactionsComplete: boolean;
    @Input() tokensComplete: boolean;
    @Input() huntStatus: number = 0;
    @Input() huntCount: number;
    @Output() getTransactions: EventEmitter<any> = new EventEmitter();
    @Output() getTokens: EventEmitter<any> = new EventEmitter();
    @Input() selectedChain: string;
    @Input() resultsFound: string[];
    @Input() tokenContent: string;
    //m1 = {timelines:{}};

    constructor() {
        // if(this.huntCount > 0) {
        //     this.animateText();
        // }
    }

    ngOnInit() {}

    ngAfterViewInit() {
        // this.animateText();
    }

    onTxnsOpen(e: any) {
        if(e.index === 0) {
            if(this.blockchain.address.transactions === null || this.blockchain.address.transactions === undefined) {
                this.getTransactions.emit(this.blockchain.symbol);
            }
        } else if(e.index === 1) {
            if(this.blockchain.address.tokens === null || this.blockchain.address.tokens === undefined) {
                this.getTokens.emit(this.blockchain.symbol);
            }
        }
    }

    /**
     * Animate text when searching
     */
    animateText() {
        let ml4: any = {};
        ml4.opacityIn = [0,1];
        ml4.scaleIn = [0.2, 1];
        ml4.scaleOut = 3;
        ml4.durationIn = 800;
        ml4.durationOut = 600;
        ml4.delay = 500;
        
        //this.m1.timelines["m14"] = 
        anime.timeline({loop: true})
            .add({
            targets: '.ml4 .letters-1',
            opacity: ml4.opacityIn,
            scale: ml4.scaleIn,
            duration: ml4.durationIn
            }).add({
            targets: '.ml4 .letters-1',
            opacity: 0,
            scale: ml4.scaleOut,
            duration: ml4.durationOut,
            easing: "easeInExpo",
            delay: ml4.delay
            }).add({
            targets: '.ml4 .letters-2',
            opacity: ml4.opacityIn,
            scale: ml4.scaleIn,
            duration: ml4.durationIn
            }).add({
            targets: '.ml4 .letters-2',
            opacity: 0,
            scale: ml4.scaleOut,
            duration: ml4.durationOut,
            easing: "easeInExpo",
            delay: ml4.delay
            }).add({
            targets: '.ml4',
            opacity: 0,
            duration: 500,
            delay: 500
        });
    }
}