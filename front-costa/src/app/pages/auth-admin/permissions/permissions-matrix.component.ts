import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { PermissionsAdminService } from '../../../core/services/auth-admin/permissions-admin.service';
import { RolesAdminService } from '../../../core/services/auth-admin/roles-admin.service';
import { ModulesAdminService } from '../../../core/services/auth-admin/modules-admin.service';
import { AuthModuleSummary, AuthRoleSummary, PermissionMatrixCell } from '../../../core/models/auth-admin.models';

@Component({
  standalone: true,
  selector: 'app-permissions-matrix',
  template: `
    <div class="page-header">
      <div>
        <h2>Matriz de permisos</h2>
        <p class="subtitle">Asigna módulos disponibles por rol.</p>
      </div>
      <button nz-button nzType="primary" (click)="saveAll()" [disabled]="saving()">Guardar</button>
    </div>

    <nz-table nzBordered [nzData]="roles()" [nzLoading]="loading()">
      <thead>
        <tr>
          <th>Rol</th>
          <th *ngFor="let module of modules()">{{ module.name }}</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let role of roles()">
          <td>{{ role.name }}</td>
          <td *ngFor="let module of modules()">
            <label nz-checkbox [ngModel]="isChecked(role.id, module.id)" (ngModelChange)="toggle(role.id, module.id, $event)"></label>
          </td>
        </tr>
      </tbody>
    </nz-table>
  `,
  styles: [
    `
      .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
      .subtitle { color: #6b7280; margin: 0; }
      nz-table { overflow-x: auto; display: block; }
    `,
  ],
  imports: [CommonModule, FormsModule, NzTableModule, NzCheckboxModule, NzButtonModule],
})
export class PermissionsMatrixComponent implements OnInit {
  private readonly permissionsService = inject(PermissionsAdminService);
  private readonly rolesService = inject(RolesAdminService);
  private readonly modulesService = inject(ModulesAdminService);
  private readonly message = inject(NzMessageService);

  readonly roles = signal<AuthRoleSummary[]>([]);
  readonly modules = signal<AuthModuleSummary[]>([]);
  readonly assignments = signal<PermissionMatrixCell[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);

  readonly lookup = computed(() => {
    const map = new Map<string, boolean>();
    for (const cell of this.assignments()) {
      map.set(`${cell.roleId}-${cell.moduleId}`, cell.enabled);
    }
    return map;
  });

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.rolesService.list().subscribe((roles) => this.roles.set(roles));
    this.modulesService.list().subscribe((modules) => this.modules.set(modules));
    this.permissionsService.getMatrix().subscribe({
      next: (matrix) => this.assignments.set(matrix ?? []),
      error: () => this.message.error('No se pudo cargar la matriz de permisos'),
      complete: () => this.loading.set(false),
    });
  }

  isChecked(roleId: string, moduleId: string): boolean {
    return this.lookup().get(`${roleId}-${moduleId}`) ?? false;
  }

  toggle(roleId: string, moduleId: string, value: boolean): void {
    const current = this.assignments();
    const idx = current.findIndex((c) => c.roleId === roleId && c.moduleId === moduleId);
    if (idx >= 0) {
      current[idx] = { ...current[idx], enabled: value };
    } else {
      current.push({ roleId, moduleId, enabled: value });
    }
    this.assignments.set([...current]);
  }

  saveAll(): void {
    this.saving.set(true);
    const grouped = new Map<string, string[]>();
    for (const cell of this.assignments()) {
      if (!cell.enabled) continue;
      if (!grouped.has(cell.roleId)) {
        grouped.set(cell.roleId, []);
      }
      grouped.get(cell.roleId)!.push(cell.moduleId);
    }

    const requests = Array.from(grouped.entries()).map(([roleId, moduleIds]) =>
      this.permissionsService.saveAssignment({ roleId, moduleIds }),
    );

    if (requests.length === 0) {
      this.message.info('No hay cambios para guardar');
      this.saving.set(false);
      return;
    }

    let completed = 0;
    requests.forEach((req) =>
      req.subscribe({
        next: () => {
          completed += 1;
          if (completed === requests.length) {
            this.message.success('Permisos actualizados');
            this.reload();
            this.saving.set(false);
          }
        },
        error: () => {
          this.message.error('Error al guardar permisos');
          this.saving.set(false);
        },
      }),
    );
  }
}
