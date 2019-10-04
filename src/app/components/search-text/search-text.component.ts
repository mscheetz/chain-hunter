import { Component, OnInit, ElementRef } from '@angular/core';

@Component({
  selector: 'app-search-text',
  templateUrl: './search-text.component.html',
  styleUrls: ['./search-text.component.css']
})
export class SearchTextComponent implements OnInit {

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
  }

  ngAfterViewInit(){
    // let s = document.createElement('script');
    // s.type = "text/javascript";
    // let script = `var ml = { timelines: {}};`;
    // script += `var ml4 = {};
    // ml4.opacityIn = [0,1];
    // ml4.scaleIn = [0.2, 1];
    // ml4.scaleOut = 3;
    // ml4.durationIn = 800;
    // ml4.durationOut = 600;
    // ml4.delay = 500;
    // ml.timelines["ml4"] = anime.timeline({loop: true})
    //   .add({
    //     targets: '.ml4 .letters-1',
    //     opacity: ml4.opacityIn,
    //     scale: ml4.scaleIn,
    //     duration: ml4.durationIn
    //   }).add({
    //     targets: '.ml4 .letters-1',
    //     opacity: 0,
    //     scale: ml4.scaleOut,
    //     duration: ml4.durationOut,
    //     easing: "easeInExpo",
    //     delay: ml4.delay
    //   }).add({
    //     targets: '.ml4 .letters-2',
    //     opacity: ml4.opacityIn,
    //     scale: ml4.scaleIn,
    //     duration: ml4.durationIn
    //   }).add({
    //     targets: '.ml4 .letters-2',
    //     opacity: 0,
    //     scale: ml4.scaleOut,
    //     duration: ml4.durationOut,
    //     easing: "easeInExpo",
    //     delay: ml4.delay
    //   }).add({
    //     targets: '.ml4 .letters-3',
    //     opacity: ml4.opacityIn,
    //     scale: ml4.scaleIn,
    //     duration: ml4.durationIn
    //   }).add({
    //     targets: '.ml4 .letters-3',
    //     opacity: 0,
    //     scale: ml4.scaleOut,
    //     duration: ml4.durationOut,
    //     easing: "easeInExpo",
    //     delay: ml4.delay
    //   }).add({
    //     targets: '.ml4',
    //     opacity: 0,
    //     duration: 500,
    //     delay: 500
    //   });`;
    // s.innerHTML = script;
    //   this.elementRef.nativeElement.appendChild(s);
  }
}
