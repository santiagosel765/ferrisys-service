import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';

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
      <button nz-button nzType="primary" (click)="goCreate()">Nuevo Usuario</button>
    </div>

    <nz-table [nzData]="users()" nzBordered [nzLoading]="loading()">
      <thead>
        <tr>
          <th>Usuario</th>
          <th>Email</th>
          <th>Nombre</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let user of users()">
          <td>{{ user.username }}</td>
          <td>{{ user.email }}</td>
          <td>{{ user.fullName || '-' }}</td>
          <td>
            <nz-tag [nzColor]="user.status === 1 ? 'green' : 'red'">
              {{ user.status === 1 ? 'Activo' : 'Inactivo' }}
            </nz-tag>
          </td>
          <td class="actions">
            <button nz-button nzType="link" (click)="edit(user.id)">Editar</button>
            <app-user-role-assignment
              [userId]="user.id"
              (completed)="reload()"
            ></app-user-role-assignment>
            <button nz-button nzDanger nzType="link" (click)="remove(user.id)">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </nz-table>
  `,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzTagModule, UserRoleAssignmentComponent],
  styles: [
    `
      .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
      .subtitle { color: #6b7280; margin: 0; }
      .actions { display: flex; gap: 4px; }
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
}
