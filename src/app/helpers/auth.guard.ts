import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { User } from '../classes/user.class';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    constructor(private router: Router, private authService: AuthenticationService){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot){
        const currentUser: User = this.authService.currentUserValue;
        const currentRoute = route.routeConfig.path;
        let status = false;
        if(currentUser) {
            if(currentRoute === 'admin-page') {
                status = +currentUser.accountTypeId === 4;
            } else {
                status = true;
            }
        }
        if(status) {
            return status;
        }

        this.router.navigate(['']);
        
        return false;
    }
}