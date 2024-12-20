import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'

})

export class AuthGuard implements CanActivate {

  constructor(public _authService: AuthService,
    public router: Router) { }

    canActivate(
      next: ActivatedRouteSnapshot,
      state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
      if (this._authService.isLoggedIn()) {
        const currentRoute = state.url;
    
        // Redirigir al dashboard si intenta acceder a la página de login
        if (currentRoute === '/login') {
          this.router.navigate(['/dashboard/home']);
          return false;
        }
        return true;
      } else {
        // Redirigir al login si no está autenticado
        this.router.navigate(['/login']);
        return false;
      }
    }
    
}