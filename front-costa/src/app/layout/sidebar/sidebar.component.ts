import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzMessageModule, NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { Subject, takeUntil } from 'rxjs';

import {
  MODULE_ICON_MAP,
  MODULE_LABEL_MAP,
  MODULE_ROUTE_MAP,
  normalizeModuleName,
} from '../../core/constants/module-route-map';
import { ModulesService } from '../../core/services/modules.service';

interface SidebarMenuItem {
  key: string;
  route: string;
  label: string;
  icon: string;
}

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

  private readonly modulesService = inject(ModulesService);
  private readonly message = inject(NzMessageService);
  private readonly cdr = inject(ChangeDetectorRef);

  private readonly destroy$ = new Subject<void>();

  loading = false;
  menuItems: SidebarMenuItem[] = [];

  ngOnInit(): void {
    this.loading = true;

    this.modulesService
      .getAllModules()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (all) => {
          this.menuItems = all
            .filter((module) => module.status === 1)
            .map((module) => normalizeModuleName(module.name) ?? module.name?.toUpperCase() ?? '')
            .filter((key) => !!key)
            .map((key) => ({ key, route: MODULE_ROUTE_MAP[key] }))
            .filter((item): item is { key: string; route: string } => !!item.route)
            .map((item) => ({
              key: item.key,
              route: item.route,
              label: MODULE_LABEL_MAP[item.key] ?? this.formatLabel(item.key),
              icon: MODULE_ICON_MAP[item.key] ?? 'appstore',
            }));

          this.loading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.loading = false;
          this.menuItems = [];
          this.cdr.markForCheck();
          this.message.error('No se pudieron cargar módulos');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  trackByKey = (_: number, item: SidebarMenuItem): string => item.key;

  private formatLabel(key: string): string {
    return key
      .toLowerCase()
      .split('_')
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }
}
