import { inject, Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

import { SessionService } from '../../services/session.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  private readonly sessionService = inject(SessionService);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const requiredModules = this.extractRequiredModules(route);

    if (requiredModules.length === 0) {
      return true;
    }

    const hasAccess = requiredModules.some((module) => this.sessionService.hasModule(module));

    return hasAccess ? true : this.router.parseUrl('/main/welcome');
  }

  private extractRequiredModules(route: ActivatedRouteSnapshot): string[] {
    const required = route.data['requiredModule'];

    if (!required) {
      return [];
    }

    return Array.isArray(required) ? required : [required];
  }
}
