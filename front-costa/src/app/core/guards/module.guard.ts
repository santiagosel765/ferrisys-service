import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { ModulesStore } from '../state/modules.store';

@Injectable({
  providedIn: 'root',
})
export class ModuleGuard implements CanActivate {
  private readonly modulesStore = inject(ModulesStore);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean | UrlTree> {
    const moduleName = route.data?.['module'] as string | undefined;

    if (!moduleName) {
      return of(true);
    }

    return this.modulesStore.loadOnce().pipe(
      take(1),
      switchMap(() => this.modulesStore.modules$.pipe(take(1))),
      map(() => this.modulesStore.hasEnabledModule(moduleName)),
      map((hasAccess) => (hasAccess ? true : this.router.parseUrl('/main/welcome'))),
      catchError(() => of(this.router.parseUrl('/main/welcome'))),
    );
  }
}
