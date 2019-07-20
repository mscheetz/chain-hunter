import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChainHunterComponent } from './components/home/chain-hunter.component';
import { HttpClientModule } from '@angular/common/http';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { SamplesComponent } from './components/samples/samples.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { ProgressBarModule } from 'primeng/progressbar';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ActiveChainsComponent } from './components/active-chains/active-chains.component';
import { CookiesComponent } from './components/cookies/cookies.component';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AccountComponent } from './components/account/account.component';

@NgModule({
  declarations: [
    AppComponent,
    ChainHunterComponent,
    SearchResultsComponent,
    SamplesComponent,
    ComingSoonComponent,
    FooterComponent,
    HeaderComponent,
    ActiveChainsComponent,
    CookiesComponent,
    AccountComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    InputTextModule,
    ButtonModule,
    TabMenuModule,
    TabViewModule,
    AccordionModule,
    BrowserAnimationsModule,
    ProgressSpinnerModule,
    PanelModule,
    ProgressBarModule,
    ToastModule
  ],
  providers: [ 
    CookieService,
    MessageService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
