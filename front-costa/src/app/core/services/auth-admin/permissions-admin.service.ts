import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../api.service';
import { RoleModulesResponse } from '../../models/auth-admin.models';

@Injectable({ providedIn: 'root' })
export class PermissionsAdminService {
  private readonly api = inject(ApiService);

  getAssignments(): Observable<RoleModulesResponse[]> {
    return this.api.get<RoleModulesResponse[]>('/v1/auth/admin/role-modules');
  }

  getMatrix(): Observable<RoleModulesResponse[]> {
    return this.getAssignments();
  }

  updateRoleModules(roleId: string, moduleIds: string[]): Observable<void> {
    return this.api.put<void>(`/v1/auth/admin/roles/${roleId}/modules`, { moduleIds });
  }
}
