import { Routes } from '@angular/router';

export const AUTH_ADMIN_ROUTES: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/users-list.component').then(m => m.UsersListComponent),
  },
  {
    path: 'users/create',
    loadComponent: () => import('./users/user-form.component').then(m => m.UserFormComponent),
  },
  {
    path: 'users/:id/edit',
    loadComponent: () => import('./users/user-form.component').then(m => m.UserFormComponent),
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles/roles-list.component').then(m => m.RolesListComponent),
  },
  {
    path: 'roles/create',
    loadComponent: () => import('./roles/role-form.component').then(m => m.RoleFormComponent),
  },
  {
    path: 'roles/:id/edit',
    loadComponent: () => import('./roles/role-form.component').then(m => m.RoleFormComponent),
  },
  {
    path: 'modules',
    loadComponent: () => import('./modules/modules-list.component').then(m => m.ModulesListComponent),
  },
  {
    path: 'modules/create',
    loadComponent: () => import('./modules/module-form.component').then(m => m.ModuleFormComponent),
  },
  {
    path: 'modules/:id/edit',
    loadComponent: () => import('./modules/module-form.component').then(m => m.ModuleFormComponent),
  },
  {
    path: 'permissions',
    loadComponent: () => import('./permissions/permissions-matrix.component').then(m => m.PermissionsMatrixComponent),
  },
  {
    path: 'licenses',
    loadComponent: () => import('./licenses/module-licenses.component').then(m => m.ModuleLicensesComponent),
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'users',
  },
];
