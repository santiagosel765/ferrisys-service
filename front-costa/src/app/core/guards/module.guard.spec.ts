import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ModulesStore } from '../state/modules.store';
import { ModuleGuard } from './module.guard';

describe('ModuleGuard', () => {
  let guard: ModuleGuard;
  let modulesStore: jasmine.SpyObj<ModulesStore>;
  let router: Router;

  beforeEach(() => {
    const modulesStoreSpy = jasmine.createSpyObj<ModulesStore>(
      'ModulesStore',
      ['loadOnce', 'hasEnabledModule'],
      { modules$: of([]) },
    );

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [
        ModuleGuard,
        { provide: ModulesStore, useValue: modulesStoreSpy },
      ],
    });

    guard = TestBed.inject(ModuleGuard);
    modulesStore = TestBed.inject(ModulesStore) as jasmine.SpyObj<ModulesStore>;
    router = TestBed.inject(Router);
  });

  const createRoute = (module?: string): ActivatedRouteSnapshot => ({
    data: module ? { module } : {},
  }) as ActivatedRouteSnapshot;

  it('should allow activation when module is available', (done) => {
    modulesStore.loadOnce.and.returnValue(of([]));
    modulesStore.hasEnabledModule.and.returnValue(true);

    guard.canActivate(createRoute('INVENTORY')).subscribe((result) => {
      expect(result).toBeTrue();
      expect(modulesStore.loadOnce).toHaveBeenCalled();
      done();
    });
  });

  it('should redirect when module is not available', (done) => {
    modulesStore.loadOnce.and.returnValue(of([]));
    modulesStore.hasEnabledModule.and.returnValue(false);

    guard.canActivate(createRoute('INVENTORY')).subscribe((result) => {
      const expectedUrl: UrlTree = router.parseUrl('/main/welcome');
      expect(result).toEqual(expectedUrl);
      done();
    });
  });

  it('should pass through when no module is defined', (done) => {
    modulesStore.loadOnce.and.returnValue(of([]));

    guard.canActivate(createRoute()).subscribe((result) => {
      expect(result).toBeTrue();
      done();
    });
  });
});
