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
import { AuthUserSummary } from '../../../core/models/auth-admin.models';

@Component({
  standalone: true,
  selector: 'app-user-form',
  template: `
    <div class="page-header">
      <div>
        <h2>{{ isEdit() ? 'Editar usuario' : 'Nuevo usuario' }}</h2>
        <p class="subtitle">Gestiona la cuenta y credenciales del usuario.</p>
      </div>
    </div>

    <nz-card nzBordered>
      <form nz-form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzFor="username" nzRequired>Usuario</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Ingresa un usuario">
            <input id="username" nz-input formControlName="username" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzFor="email" nzRequired>Email</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Email inválido">
            <input id="email" nz-input formControlName="email" type="email" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzFor="fullName" nzRequired>Nombre completo</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Requerido">
            <input id="fullName" nz-input formControlName="fullName" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label [nzSpan]="6" nzFor="status">Estado</nz-form-label>
          <nz-form-control [nzSpan]="18">
            <nz-select id="status" formControlName="status">
              <nz-option [nzValue]="1" nzLabel="Activo"></nz-option>
              <nz-option [nzValue]="0" nzLabel="Inactivo"></nz-option>
            </nz-select>
          </nz-form-control>
        </nz-form-item>

        <nz-form-item *ngIf="!isEdit()">
          <nz-form-label [nzSpan]="6" nzFor="password" nzRequired>Contraseña</nz-form-label>
          <nz-form-control [nzSpan]="18" nzErrorTip="Ingresa una contraseña">
            <input id="password" nz-input type="password" formControlName="password" />
          </nz-form-control>
        </nz-form-item>

        <div class="actions">
          <button nz-button nzType="link" type="button" (click)="cancel()">Cancelar</button>
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
      .subtitle { color: #6b7280; margin: 0; }
      .form-grid { max-width: 720px; margin: 0 auto; }
      .actions { display: flex; justify-content: flex-end; gap: 8px; padding-top: 16px; }
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

  readonly saving = signal(false);
  readonly isEdit = signal(false);

  readonly form = this.fb.nonNullable.group({
    id: this.fb.control<string | null>(null),
    username: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    fullName: ['', [Validators.required]],
    password: ['', []],
    status: this.fb.control<number>(1),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.form.get('password')?.clearValidators();
      this.form.get('password')?.updateValueAndValidity();
      this.service.get(id).subscribe((user) => {
        this.form.patchValue({ ...user, password: '' });
      });
    } else {
      this.form.get('password')?.setValidators([Validators.required]);
      this.form.get('password')?.updateValueAndValidity();
    }
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
