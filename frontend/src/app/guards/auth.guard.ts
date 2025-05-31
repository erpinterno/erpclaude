import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    if (this.authService.isAuthenticated()) {
      const requiredRoles = route.data['roles'] as Array<string>;
      
      if (requiredRoles && requiredRoles.length > 0) {
        const currentUser = this.authService.getCurrentUserValue();
        
        if (currentUser && currentUser.role && requiredRoles.includes(currentUser.role)) {
          return true;
        } else {
          console.warn('Acesso negado. Role insuficiente.');
          this.router.navigate(['/dashboard']);
          return false;
        }
      }
      
      return true;
    }

    console.log('Usuário não autenticado. Redirecionando para login...');
    
    const returnUrl = state.url;
    this.router.navigate(['/login'], { 
      queryParams: { returnUrl: returnUrl }
    });
    
    return false;
  }
}
