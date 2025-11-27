import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';
import { PermissionMatrixCell, RoleModuleAssignment } from '../../models/auth-admin.models';

@Injectable({ providedIn: 'root' })
export class PermissionsAdminService {
  private readonly api = inject(ApiService);

  getMatrix(): Observable<PermissionMatrixCell[]> {
    return this.api.get<PermissionMatrixCell[]>('/v1/auth/admin/role-modules');
  }

  saveAssignment(payload: RoleModuleAssignment): Observable<void> {
    return this.api.post<void>('/v1/auth/admin/role-modules', payload);
  }
}
