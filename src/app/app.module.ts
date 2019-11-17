import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Routes, RouterModule } from '@angular/router';

import { CookieService } from 'ngx-cookie-service';

import { NgxQRCodeModule } from 'node_modules/ngx-qrcode2';

import { InputTextModule } from 'primeng/inputtext';
import { InputMaskModule } from 'primeng/inputmask';
import { ButtonModule } from 'primeng/button';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { AccordionModule } from 'primeng/accordion';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { SlideMenuModule } from 'primeng/slidemenu';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { CardModule } from 'primeng/card';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ChainHunterComponent } from './components/home/chain-hunter.component';
import { SamplesComponent } from './components/samples/samples.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { ComingSoonComponent } from './components/coming-soon/coming-soon.component';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { ActiveChainsComponent } from './components/active-chains/active-chains.component';
import { CookiesComponent } from './components/cookies/cookies.component';
import { AccountComponent } from './components/account/account.component';
import { AboutComponent } from './components/about/about.component';
import { NavigationComponent } from './components/navigation/navigation.component';
import { TermsComponent } from './components/terms/terms.component';
import { TopAdComponent } from './components/top-ad/top-ad.component';
import { RightAdComponent } from './components/right-ad/right-ad.component';
import { BottomAdComponent } from './components/bottom-ad/bottom-ad.component';
import { BlockchainInfoComponent } from './components/blockchain-info/blockchain-info.component';
import { TransactionComponent } from './components/transaction/transaction.component';
import { LoginComponent } from './components/login/login.component';
import { TopNavComponent } from './components/top-nav/top-nav.component';
import { MyPageComponent } from './components/my-page/my-page.component';
import { AuthGuard } from './helpers/auth.guard';
import { AuthInterceptor } from './services/authIntercepter.service';
import { LoginService } from './services/login.service';
import { AddressDetailComponent } from './components/address-detail/address-detail.component';
import { ContractDetailComponent } from './components/contract-detail/contract-detail.component';
import { MyHuntsComponent } from './components/my-hunts/my-hunts.component';
import { AccountTypesComponent } from './components/account-types/account-types.component';
import { PasswordComponent } from './components/password/password.component';
import { VerifyComponent } from './components/verify/verify.component';
import { PaymentComponent } from './components/payment/payment.component';
import { SquarePaymentComponent } from './components/square-payment/square-payment.component';

const appRoutes: Routes = [
  { path: '', component: ChainHunterComponent },
  { path: 'about', component: AboutComponent },
  { path: 'terms', component: TermsComponent },
  { path: 'info', component: BlockchainInfoComponent },
  { path: 'hunts', component: MyHuntsComponent, canActivate: [AuthGuard] },
  { path: 'mypage', component: MyPageComponent, canActivate: [AuthGuard] },
  { path: 'accounts', component: AccountTypesComponent },
  { path: 'password/:id', component: PasswordComponent },
  { path: 'payment', component: PaymentComponent },
  { path: 'verify/:id', component: VerifyComponent }
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
    LoginComponent,
    TopNavComponent,
    MyPageComponent,
    AddressDetailComponent,
    ContractDetailComponent,
    MyHuntsComponent,
    AccountTypesComponent,
    PasswordComponent,
    VerifyComponent,
    PaymentComponent,
    SquarePaymentComponent
  ],
  imports: [
    AccordionModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    ButtonModule,
    CardModule,
    DialogModule,
    FormsModule,
    HttpClientModule,
    InputMaskModule,
    InputTextModule,
    NgxQRCodeModule,
    OverlayPanelModule,
    PanelModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    SelectButtonModule,
    SlideMenuModule,
    TableModule,
    TabMenuModule,
    TabViewModule,
    ToastModule,
    RouterModule.forRoot(appRoutes)
  ],
  providers: [ 
    CookieService,
    MessageService,
    LoginService,
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule { }
