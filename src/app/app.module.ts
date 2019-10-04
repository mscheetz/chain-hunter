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
import { Routes, RouterModule } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { SlideMenuModule } from 'primeng/slidemenu';
import { TermsComponent } from './components/terms/terms.component';
import { TopAdComponent } from './components/top-ad/top-ad.component';
import { RightAdComponent } from './components/right-ad/right-ad.component';
import { BottomAdComponent } from './components/bottom-ad/bottom-ad.component';
import { TableModule } from 'primeng/table';
import { BlockchainInfoComponent } from './components/blockchain-info/blockchain-info.component';
import { DialogModule } from 'primeng/dialog';
import { NgxQRCodeModule } from 'node_modules/ngx-qrcode2';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { TransactionComponent } from './components/transaction/transaction.component';
import { SearchTextComponent } from './components/search-text/search-text.component';

const appRoutes: Routes = [
  { path: '', component: ChainHunterComponent },
  { path: 'about', component: AboutComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'info', component: BlockchainInfoComponent }
]

@NgModule({
  declarations: [
    AppComponent,
    AboutComponent,
    AccountComponent,
    ActiveChainsComponent,
    BlockchainInfoComponent,
    BottomAdComponent,
    ChainHunterComponent,
    ComingSoonComponent,
    CookiesComponent,
    FooterComponent,
    HeaderComponent,
    NavigationComponent,
    RightAdComponent,
    SamplesComponent,
    SearchResultsComponent,
    TermsComponent,
    TopAdComponent,
    TransactionComponent,
    SearchTextComponent
  ],
  imports: [
    AccordionModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ButtonModule,
    DialogModule,
    FormsModule,
    HttpClientModule,
    InputTextModule,
    NgxQRCodeModule,
    OverlayPanelModule,
    PanelModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    SlideMenuModule,
    TableModule,
    TabMenuModule,
    TabViewModule,
    ToastModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [ 
    CookieService,
    MessageService
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
