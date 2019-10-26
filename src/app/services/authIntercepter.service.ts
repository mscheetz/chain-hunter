import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const jwt = localStorage.getItem(environment.jwtName);

        if(jwt) {
            const cloned = req.clone({
                headers: req.headers.set("Authorization", "Bearer " + jwt)
            });

            return next.handle(cloned);
        } else {
            return next.handle(req);
        }
    }
}