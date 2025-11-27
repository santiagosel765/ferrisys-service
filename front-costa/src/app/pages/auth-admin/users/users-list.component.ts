import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { UsersAdminService } from '../../../core/services/auth-admin/users-admin.service';
import { AuthUserSummary } from '../../../core/models/auth-admin.models';
import { UserRoleAssignmentComponent } from './user-role-assignment.component';

@Component({
  standalone: true,
  selector: 'app-users-list',
  template: `
    <div class="page-header">
      <div>
        <h2>Usuarios</h2>
        <p class="subtitle">Gestión de cuentas, estado y roles asignados.</p>
      </div>
      <button nz-button nzType="primary" (click)="goCreate()">
        <span nz-icon nzType="user-add"></span>
        Nuevo Usuario
      </button>
    </div>

    <nz-card nzBordered>
      <nz-table
        [nzData]="users()"
        [nzLoading]="loading()"
        nzBordered
        [nzPageSize]="10"
        nzShowPagination
        nzPaginationPosition="bottom"
        [nzNoResult]="noUsers"
      >
        <thead>
          <tr>
            <th>Usuario</th>
            <th>Email</th>
            <th>Nombre</th>
            <th>Estado</th>
            <th>Roles</th>
            <th class="actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let user of users()">
            <td class="text-strong">{{ user.username }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.fullName || '-' }}</td>
            <td>
              <nz-tag [nzColor]="user.status === 1 ? 'green' : 'default'">
                {{ user.status === 1 ? 'Activo' : 'Inactivo' }}
              </nz-tag>
            </td>
            <td>{{ rolesLabel(user) }}</td>
            <td class="actions">
              <button nz-button nzType="link" (click)="edit(user.id)">
                <span nz-icon nzType="edit"></span>
                Editar
              </button>
              <app-user-role-assignment [userId]="user.id" (completed)="reload()"></app-user-role-assignment>
              <button nz-button nzType="link" nzDanger (click)="remove(user.id)">
                <span nz-icon nzType="delete"></span>
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
      <ng-template #noUsers>
        <div class="empty-state">
          <p>No hay usuarios registrados todavía.</p>
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
    UserRoleAssignmentComponent,
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
export class UsersListComponent implements OnInit {
  private readonly service = inject(UsersAdminService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  readonly users = signal<AuthUserSummary[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => this.users.set(data ?? []),
      error: () => this.message.error('No se pudieron cargar los usuarios'),
      complete: () => this.loading.set(false),
    });
  }

  goCreate(): void {
    this.router.navigate(['/main/auth/users/create']);
  }

  edit(id: string): void {
    this.router.navigate(['/main/auth/users', id, 'edit']);
  }

  remove(id: string): void {
    this.loading.set(true);
    this.service.delete(id).subscribe({
      next: () => {
        this.message.success('Usuario eliminado');
        this.reload();
      },
      error: () => this.message.error('No se pudo eliminar el usuario'),
      complete: () => this.loading.set(false),
    });
  }

  rolesLabel(user: AuthUserSummary): string {
    if (user.roles && user.roles.length > 0) {
      return user.roles.join(', ');
    }
    if (user.roleName) {
      return user.roleName;
    }
    return 'Sin rol asignado';
  }
}
