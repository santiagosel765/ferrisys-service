import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly storageKey = 'enabledModules';
  private readonly modulesSubject = new BehaviorSubject<string[]>(this.readModulesFromStorage());

  readonly modules$: Observable<string[]> = this.modulesSubject.asObservable();

  setModules(modules: string[]): void {
    const normalized = Array.isArray(modules) ? modules : [];
    sessionStorage.setItem(this.storageKey, JSON.stringify(normalized));
    this.modulesSubject.next(normalized);
  }

  getModules(): string[] {
    return this.modulesSubject.value;
  }

  hasModule(module: string): boolean {
    if (!module) {
      return false;
    }

    const normalizedModule = module.toUpperCase();
    return this.modulesSubject.value.some((value) => value?.toUpperCase() === normalizedModule);
  }

  clear(): void {
    sessionStorage.removeItem(this.storageKey);
    this.modulesSubject.next([]);
  }

  private readModulesFromStorage(): string[] {
    const rawValue = sessionStorage.getItem(this.storageKey);
    if (!rawValue) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawValue);
      return Array.isArray(parsed) ? (parsed as string[]) : [];
    } catch {
      return [];
    }
  }
}
