import { Component, OnInit, NgZone } from '@angular/core';

import * as am4core from "@amcharts/amcharts4/core";
import * as am4maps from "@amcharts/amcharts4/maps";
import am4geodata_worldLow from "@amcharts/amcharts4-geodata/worldLow";

import { ApiService } from 'src/app/services/api.service';
import { TopSearchResult } from 'src/app/classes/top-search-result.class';


@Component({
  selector: 'app-search-map',
  templateUrl: './search-map.component.html',
  styleUrls: ['./search-map.component.css']
})
export class SearchMapComponent implements OnInit {
  searchResults: TopSearchResult[] = [];
  private chart: am4maps.MapChart;
  initReady: boolean = false;
  apiReady: boolean = false;

  constructor(private apiSvc: ApiService, private zone: NgZone) { 
    this.getData();
  }

  ngAfterViewInit() {
    this.initReady = true;
    this.loadChart();
  }

  async getData() {
    await this.apiSvc.getTopChainByCountry()
      .subscribe(res => {
        this.searchResults = res;
        this.apiReady = true;
        this.searchResults.forEach(s => s["fill"] = am4core.color("#00AEEF"));
        this.loadChart();
      })
  }

  loadChart() {
    if(!this.apiReady || !this.initReady) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      let chart = am4core.create("map-div", am4maps.MapChart);

      chart.geodata = am4geodata_worldLow;

      chart.projection = new am4maps.projections.Miller();

      let worldSeries = chart.series.push(new am4maps.MapPolygonSeries());
      worldSeries.exclude = ["AQ"];
      worldSeries.useGeodata = true;
      worldSeries.data = this.searchResults;
      
      let polygonTemplate = worldSeries.mapPolygons.template;
      polygonTemplate.tooltipText = "{name}: {chain}";
      polygonTemplate.propertyFields.fill = "fill";
      polygonTemplate.nonScalingStroke = true;

      let hs = polygonTemplate.states.create("hover");
      hs.properties.fill = am4core.color("#0CF8B6");

      this.chart = chart;
    });
  }

  ngOnInit() {
  }

}
