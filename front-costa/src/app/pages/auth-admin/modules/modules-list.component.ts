import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzIconModule } from 'ng-zorro-antd/icon';

import { ModulesAdminService } from '../../../core/services/auth-admin/modules-admin.service';
import { AuthModuleSummary } from '../../../core/models/auth-admin.models';

@Component({
  standalone: true,
  selector: 'app-modules-list',
  template: `
    <div class="page-header">
      <div>
        <h2>Módulos</h2>
        <p class="subtitle">Lista de módulos configurables y licencias.</p>
      </div>
      <button nz-button nzType="primary" (click)="goCreate()">
        <span nz-icon nzType="plus"></span>
        Nuevo Módulo
      </button>
    </div>

    <nz-card nzBordered>
      <nz-table
        [nzData]="modules()"
        [nzLoading]="loading()"
        nzBordered
        [nzPageSize]="10"
        nzShowPagination
        nzPaginationPosition="bottomRight"
        [nzNoResult]="noModules"
      >
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Estado</th>
            <th class="actions-col">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let module of modules()">
            <td class="text-strong">{{ module.name }}</td>
            <td>{{ module.description || 'Sin descripción' }}</td>
            <td><nz-tag [nzColor]="module.status === 1 ? 'green' : 'default'">{{ module.status === 1 ? 'Activo' : 'Inactivo' }}</nz-tag></td>
            <td class="actions">
              <button nz-button nzType="link" (click)="edit(module.id)">
                <span nz-icon nzType="edit"></span>
                Editar
              </button>
              <button nz-button nzType="link" nzDanger (click)="remove(module.id)">
                <span nz-icon nzType="delete"></span>
                Eliminar
              </button>
            </td>
          </tr>
        </tbody>
      </nz-table>
      <ng-template #noModules>
        <div class="empty-state">
          <p>No hay módulos registrados todavía.</p>
          <button nz-button nzType="dashed" (click)="goCreate()">
            <span nz-icon nzType="plus"></span>
            Crear el primero
          </button>
        </div>
      </ng-template>
    </nz-card>
  `,
  imports: [CommonModule, NzTableModule, NzButtonModule, NzTagModule, NzCardModule, NzIconModule],
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
export class ModulesListComponent implements OnInit {
  private readonly service = inject(ModulesAdminService);
  private readonly router = inject(Router);
  private readonly message = inject(NzMessageService);

  readonly modules = signal<AuthModuleSummary[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (data) => this.modules.set(data ?? []),
      error: () => this.message.error('No se pudieron cargar los módulos'),
      complete: () => this.loading.set(false),
    });
  }

  goCreate(): void {
    this.router.navigate(['/main/auth/modules/create']);
  }

  edit(id: string): void {
    this.router.navigate(['/main/auth/modules', id, 'edit']);
  }

  remove(id: string): void {
    this.loading.set(true);
    this.service.delete(id).subscribe({
      next: () => {
        this.message.success('Módulo eliminado');
        this.reload();
      },
      error: () => this.message.error('No se pudo eliminar el módulo'),
      complete: () => this.loading.set(false),
    });
  }
}
