import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { RolesAdminService } from '../../../core/services/auth-admin/roles-admin.service';
import { AuthRoleSummary } from '../../../core/models/auth-admin.models';
import { RoleModulesAssignmentComponent } from './role-modules-assignment.component';

@Component({
  standalone: true,
  selector: 'app-roles-list',
  template: `
    <div class="page-header">
      <div>
        <h2>Roles</h2>
        <p class="subtitle">Agrupa permisos y módulos para los usuarios.</p>
      </div>
      <button nz-button nzType="primary" (click)="goCreate()">
        <span nz-icon nzType="plus"></span>
        Nuevo Rol
      </button>
    </div>

    <nz-card nzBordered>
      <nz-table
        [nzData]="roles()"
        [nzLoading]="loading()"
        nzBordered
        [nzPageSize]="10"
        nzShowPagination
        nzPaginationPosition="bottom"
        [nzNoResult]="noRoles"
      >
        <thead>
          <tr>
            <th>Rol</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th class="actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let role of roles()">
            <td class="text-strong">{{ role.name }}</td>
            <td>{{ role.description || 'Sin descripción' }}</td>
            <td>
              <nz-tag [nzColor]="role.status === 1 ? 'green' : 'default'">{{ role.status === 1 ? 'Activo' : 'Inactivo' }}</nz-tag>
            </td>
            <td class="actions">
              <button nz-button nzType="link" (click)="edit(role.id)">
                <span nz-icon nzType="edit"></span>
                Editar
              </button>
              <app-role-modules-assignment [roleId]="role.id" (completed)="reload()"></app-role-modules-assignment>
              <button nz-button nzType="link" nzDanger (click)="remove(role.id)">
                <span nz-icon nzType="delete"></span>
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
      <ng-template #noRoles>
        <div class="empty-state">
          <p>No hay roles registrados todavía.</p>
          <button nz-button nzType="dashed" (click)="goCreate()">
            <span nz-icon nzType="plus"></span>
            Crear el primero
          </button>
        </div>
      </ng-template>
    </nz-card>
  `,
  imports: [
    CommonModule,
    NzTableModule,
    NzButtonModule,
    NzTagModule,
    NzCardModule,
    NzIconModule,
    RoleModulesAssignmentComponent,
  ],
  styles: [
    `
      .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
      .subtitle { color: #6b7280; margin: 0; }
      .actions { display: flex; gap: 8px; align-items: center; }
      .actions-col { width: 220px; }
      .text-strong { font-weight: 600; }
      .empty-state { text-align: center; padding: 24px 0; color: #6b7280; display: flex; flex-direction: column; gap: 12px; }
    `,
  ],
})
export class RolesListComponent implements OnInit {
  private readonly service = inject(RolesAdminService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  readonly roles = signal<AuthRoleSummary[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => this.roles.set(data ?? []),
      error: () => this.message.error('No se pudieron cargar los roles'),
      complete: () => this.loading.set(false),
    });
  }

  goCreate(): void {
    this.router.navigate(['/main/auth/roles/create']);
  }

  edit(id: string): void {
    this.router.navigate(['/main/auth/roles', id, 'edit']);
  }

  remove(id: string): void {
    this.loading.set(true);
    this.service.delete(id).subscribe({
      next: () => {
        this.message.success('Rol eliminado');
        this.reload();
      },
      error: () => this.message.error('No se pudo eliminar el rol'),
      complete: () => this.loading.set(false),
    });
  }
}
