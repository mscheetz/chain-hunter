import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChainHunterComponent } from './components/home/chain-hunter.component';
import { BtcResultsComponent } from './components/btc-results/btc-results.component';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { EthResultsComponent } from './components/eth-results/eth-results.component';
import { BchResultsComponent } from './components/bch-results/bch-results.component';
import { LtcResultsComponent } from './components/ltc-results/ltc-results.component';
import { RvnResultsComponent } from './components/rvn-results/rvn-results.component';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
  declarations: [
    AppComponent,
    ChainHunterComponent,
    BchResultsComponent,
    BtcResultsComponent,
    EthResultsComponent,
    LtcResultsComponent,
    RvnResultsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    InputTextModule,
    ButtonModule,
    TabMenuModule,
    TabViewModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
