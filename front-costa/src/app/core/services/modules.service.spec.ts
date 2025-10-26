import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ModulesService, ModulesResponse } from './modules.service';
import { ApiService } from './api.service';

describe('ModulesService', () => {
  let service: ModulesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiService, ModulesService],
    });

    service = TestBed.inject(ModulesService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call the modules endpoint and return data', () => {
    const mockResponse: ModulesResponse = {
      content: [
        { id: '1', name: 'INVENTORY', description: 'Inventory module', status: 1 },
      ],
    };

    service.getModules().subscribe((response) => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${environment.apiBaseUrl}/v1/auth/modules`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
