import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';

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
      <button nz-button nzType="primary" (click)="goCreate()">Nuevo Rol</button>
    </div>

    <nz-table [nzData]="roles()" nzBordered [nzLoading]="loading()">
      <thead>
        <tr>
          <th>Rol</th>
          <th>Descripción</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let role of roles()">
          <td>{{ role.name }}</td>
          <td>{{ role.description }}</td>
          <td>
            <nz-tag [nzColor]="role.status === 1 ? 'green' : 'red'">{{ role.status === 1 ? 'Activo' : 'Inactivo' }}</nz-tag>
          </td>
          <td class="actions">
            <button nz-button nzType="link" (click)="edit(role.id)">Editar</button>
            <app-role-modules-assignment [roleId]="role.id" (completed)="reload()"></app-role-modules-assignment>
            <button nz-button nzDanger nzType="link" (click)="remove(role.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </nz-table>
  `,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzTagModule, RoleModulesAssignmentComponent],
  styles: [
    `
      .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
      .subtitle { color: #6b7280; margin: 0; }
      .actions { display: flex; gap: 4px; }
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
