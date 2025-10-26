import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from './api.service';

export interface ModuleDTO {
  id: string;
  name: string;
  description: string;
  status: number;
}

export interface ModulesResponse {
  content: ModuleDTO[];
}

@Injectable({
  providedIn: 'root',
})
export class ModulesService {
  private readonly api = inject(ApiService);

  getModules(): Observable<ModulesResponse> {
    return this.api.get<ModulesResponse>('/v1/auth/modules');
  }
}
