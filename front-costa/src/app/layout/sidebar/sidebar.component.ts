import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Observable, Subject } from 'rxjs';
import { filter, map, takeUntil } from 'rxjs/operators';

import { MODULE_ROUTE_MAP } from '../../core/config/module-route-map';
import { ModuleDTO } from '../../core/services/modules.service';
import { ModulesStore } from '../../core/state/modules.store';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, NzIconModule, NzMenuModule, NzMessageModule, NzSpinModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Input() collapsed = false;

  private readonly modulesStore = inject(ModulesStore);
  private readonly message = inject(NzMessageService);

  private readonly destroy$ = new Subject<void>();

  readonly MODULE_ROUTE_MAP = MODULE_ROUTE_MAP;
  readonly loading$: Observable<boolean> = this.modulesStore.loading$;
  readonly modules$: Observable<ModuleDTO[]> = this.modulesStore.modules$.pipe(
    map((modules) =>
      modules.filter((module) => module.status === 1 && !!MODULE_ROUTE_MAP[module.name]),
    ),
  );

  ngOnInit(): void {
    this.modulesStore.loadOnce().pipe(takeUntil(this.destroy$)).subscribe();

    this.modulesStore.error$
      .pipe(
        takeUntil(this.destroy$),
        filter((hasError) => hasError),
      )
      .subscribe(() => {
        this.message.error('No se pudieron cargar módulos');
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByModule = (_: number, module: ModuleDTO): string => module.id ?? module.name;
}
