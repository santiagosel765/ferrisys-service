import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';

import { ModuleDTO, ModulesService } from '../services/modules.service';

@Injectable({
  providedIn: 'root',
})
export class ModulesStore {
  private readonly modulesService = inject(ModulesService);

  private readonly modulesSubject = new BehaviorSubject<ModuleDTO[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  private readonly errorSubject = new BehaviorSubject<boolean>(false);

  private hasLoaded = false;
  private inFlight$?: Observable<ModuleDTO[]>;

  readonly modules$: Observable<ModuleDTO[]> = this.modulesSubject.asObservable();
  readonly loading$: Observable<boolean> = this.loadingSubject.asObservable();
  readonly error$: Observable<boolean> = this.errorSubject.asObservable();

  loadOnce(): Observable<ModuleDTO[]> {
    if (this.hasLoaded) {
      return this.modules$;
    }

    if (this.inFlight$) {
      return this.inFlight$;
    }

    this.loadingSubject.next(true);
    this.errorSubject.next(false);

    this.inFlight$ = this.modulesService.getModules().pipe(
      map((response) => response?.content ?? []),
      tap((modules) => {
        this.modulesSubject.next(modules);
        this.hasLoaded = true;
      }),
      catchError(() => {
        this.errorSubject.next(true);
        this.modulesSubject.next([]);
        return of([]);
      }),
      finalize(() => {
        this.loadingSubject.next(false);
        this.inFlight$ = undefined;
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.inFlight$;
  }

  hasEnabledModule(moduleName: string | undefined): boolean {
    if (!moduleName) {
      return false;
    }

    const normalized = moduleName.toUpperCase();
    return this.modulesSubject.value.some(
      (module) => module.status === 1 && module.name?.toUpperCase() === normalized,
    );
  }

  reset(): void {
    this.hasLoaded = false;
    this.inFlight$ = undefined;
    this.modulesSubject.next([]);
    this.loadingSubject.next(false);
    this.errorSubject.next(false);
  }
}
