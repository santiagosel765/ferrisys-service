import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzCardModule } from 'ng-zorro-antd/card';

import { UsersAdminService } from '../../../core/services/auth-admin/users-admin.service';
import { AuthRoleSummary, AuthUserSummary } from '../../../core/models/auth-admin.models';
import { RolesAdminService } from '../../../core/services/auth-admin/roles-admin.service';

@Component({
  standalone: true,
  selector: 'app-user-form',
  template: `
    <div class="page-header">
      <div>
        <p class="eyebrow">Usuarios</p>
        <h2 class="page-title">{{ isEdit() ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
        <p class="subtitle">Gestiona la cuenta, el estado y los roles asignados.</p>
      </div>
      <button nz-button nzType="default" type="button" (click)="cancel()" [disabled]="saving()">
        Volver al listado
      </button>
    </div>

    <nz-card nzBordered class="form-card">
      <form nz-form nzLayout="vertical" [formGroup]="form" (ngSubmit)="submit()">
        <div class="form-grid">
          <nz-form-item>
            <nz-form-label nzRequired nzFor="username">Usuario</nz-form-label>
            <nz-form-control nzErrorTip="Ingresa un usuario válido">
              <input id="username" nz-input formControlName="username" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired nzFor="email">Email</nz-form-label>
            <nz-form-control nzErrorTip="Email inválido">
              <input id="email" nz-input formControlName="email" type="email" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired nzFor="fullName">Nombre completo</nz-form-label>
            <nz-form-control nzErrorTip="Requerido">
              <input id="fullName" nz-input formControlName="fullName" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzFor="status" nzRequired>Estado</nz-form-label>
            <nz-form-control>
              <nz-select id="status" formControlName="status" nzPlaceHolder="Selecciona un estado">
                <nz-option [nzValue]="1" nzLabel="Activo"></nz-option>
                <nz-option [nzValue]="0" nzLabel="Inactivo"></nz-option>
              </nz-select>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item *ngIf="!isEdit()">
            <nz-form-label nzFor="password" nzRequired>Contraseña</nz-form-label>
            <nz-form-control nzErrorTip="Ingresa una contraseña">
              <input id="password" nz-input type="password" formControlName="password" />
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzFor="roleIds">Roles</nz-form-label>
            <nz-form-control>
              <nz-select
                id="roleIds"
                formControlName="roleIds"
                nzMode="multiple"
                nzPlaceHolder="Selecciona los roles para este usuario"
                [nzLoading]="loadingRoles()"
              >
                <nz-option *ngFor="let role of roles()" [nzValue]="role.id" [nzLabel]="role.name"></nz-option>
              </nz-select>
              <div class="hint" *ngIf="!roles().length && !loadingRoles()">No hay roles disponibles.</div>
            </nz-form-control>
          </nz-form-item>
        </div>

        <div class="actions">
          <button nz-button nzType="default" type="button" (click)="cancel()">Cancelar</button>
          <button nz-button nzType="primary" [disabled]="form.invalid || saving()" type="submit">
            {{ isEdit() ? 'Guardar cambios' : 'Crear usuario' }}
          </button>
        </div>
      </form>
    </nz-card>
  `,
  styles: [
    `
      .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
      .page-title { margin: 0; font-size: 24px; font-weight: 700; }
      .eyebrow { text-transform: uppercase; letter-spacing: 0.06em; margin: 0; color: #6b7280; font-size: 12px; }
      .subtitle { color: #6b7280; margin: 4px 0 0; }
      .form-card { box-shadow: 0 8px 24px rgba(15, 23, 42, 0.06); }
      .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; }
      .actions { display: flex; justify-content: flex-end; gap: 12px; padding-top: 12px; }
      .hint { color: #6b7280; margin-top: 6px; }
      @media (max-width: 768px) {
        .page-header { flex-direction: column; align-items: flex-start; gap: 8px; }
        .actions { justify-content: flex-start; }
      }
    `,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzSelectModule,
    NzCardModule,
  ],
})
export class UserFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(UsersAdminService);
  private readonly message = inject(NzMessageService);
  private readonly rolesService = inject(RolesAdminService);

  readonly saving = signal(false);
  readonly isEdit = signal(false);
  readonly roles = signal<AuthRoleSummary[]>([]);
  readonly loadingRoles = signal(false);

  readonly form = this.fb.nonNullable.group({
    id: this.fb.control<string | null>(null),
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', [Validators.required]],
    password: ['', []],
    status: this.fb.control<number>(1),
    roleIds: this.fb.control<string[]>([]),
  });

  ngOnInit(): void {
    this.loadRoles();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.service.get(id).subscribe((user) => {
        this.form.patchValue({ ...user, password: '', roleIds: user.roleIds ?? [] });
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('password')?.updateValueAndValidity();
    }
  }

  private loadRoles(): void {
    this.loadingRoles.set(true);
    this.rolesService.list().subscribe({
      next: (roles) => this.roles.set(roles ?? []),
      error: () => this.message.error('No se pudieron cargar los roles'),
      complete: () => this.loadingRoles.set(false),
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { id, password, ...rest } = this.form.getRawValue();
    this.saving.set(true);

    const payload: Partial<AuthUserSummary> & { password?: string } = {
      ...rest,
      status: rest.status ?? 1,
      roleIds: rest.roleIds ?? [],
    };
    if (!this.isEdit() && password) {
      payload['password'] = password;
    }

    const request$ = this.isEdit() && id
      ? this.service.update(id, payload)
      : this.service.create(payload);

    request$.subscribe({
      next: () => {
        this.message.success('Usuario guardado');
        this.router.navigate(['/main/auth'], { queryParams: { tab: 'users' } });
      },
      error: () => this.message.error('No se pudo guardar el usuario'),
      complete: () => this.saving.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/main/auth'], { queryParams: { tab: 'users' } });
  }
}
