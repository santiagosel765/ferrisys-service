import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';

import { UsersAdminService } from '../../../core/services/auth-admin/users-admin.service';
import { AuthUserSummary } from '../../../core/models/auth-admin.models';

@Component({
  standalone: true,
  selector: 'app-user-form',
  template: `
    <div class="page-header">
      <div>
        <h2>{{ isEdit() ? 'Editar usuario' : 'Crear usuario' }}</h2>
        <p class="subtitle">Formulario reactivo con validaciones básicas.</p>
      </div>
    </div>

    <form nz-form [formGroup]="form" (ngSubmit)="submit()" class="form">
      <label nz-form-item>
        <span nz-form-label>Usuario</span>
        <nz-form-control nzErrorTip="Requerido">
          <input nz-input formControlName="username" />
        </nz-form-control>
      </label>

      <label nz-form-item>
        <span nz-form-label>Email</span>
        <nz-form-control nzErrorTip="Email inválido">
          <input nz-input formControlName="email" type="email" />
        </nz-form-control>
      </label>

      <label nz-form-item>
        <span nz-form-label>Nombre</span>
        <nz-form-control>
          <input nz-input formControlName="fullName" />
        </nz-form-control>
      </label>

      <label nz-form-item *ngIf="!isEdit()">
        <span nz-form-label>Contraseña</span>
        <nz-form-control nzErrorTip="Requerido">
          <input nz-input type="password" formControlName="password" />
        </nz-form-control>
      </label>

      <div class="actions">
        <button nz-button nzType="default" (click)="cancel()" type="button">Cancelar</button>
        <button nz-button nzType="primary" [disabled]="form.invalid || saving()" type="submit">
          {{ isEdit() ? 'Guardar cambios' : 'Crear usuario' }}
        </button>
      </div>
    </form>
  `,
  styles: [
    `
      .form { max-width: 520px; display: flex; flex-direction: column; gap: 12px; }
      .page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
      .subtitle { color: #6b7280; margin: 0; }
      .actions { display: flex; gap: 8px; justify-content: flex-end; }
    `,
  ],
  imports: [CommonModule, ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule],
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
    fullName: [''],
    password: ['', [Validators.required]],
    status: this.fb.control<number>(1),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.service.get(id).subscribe((user) => {
        this.form.patchValue({ ...user, password: '' });
      });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { id, password, ...rest } = this.form.getRawValue();
    this.saving.set(true);

    const payload: Partial<AuthUserSummary> & { password?: string } = { ...rest };
    if (!this.isEdit()) {
      payload['password'] = password || undefined;
    }

    const request$ = this.isEdit() && id
      ? this.service.update(id, payload)
      : this.service.create(payload);

    request$.subscribe({
      next: () => {
        this.message.success('Usuario guardado');
        this.router.navigate(['/main/auth/users']);
      },
      error: () => this.message.error('No se pudo guardar el usuario'),
      complete: () => this.saving.set(false),
    });
  }

  cancel(): void {
    this.router.navigate(['/main/auth/users']);
  }
}
