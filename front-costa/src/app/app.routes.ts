// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';

export const routes: Routes = [
  // 🔑 Login completamente independiente
  {
    path: 'login',
    loadChildren: () => import('./auth/login/login.routes').then(m => m.login_routes)
  },
  
  // 🏠 Todas las páginas principales con layout
  {
    path: 'main',
    component: MainLayoutComponent,
    children: [
      {
        path: 'welcome',
        loadChildren: () => import('./pages/welcome/welcome.routes').then(m => m.WELCOME_ROUTES)
      },
      {
        path: 'categories',  // 🆕 Rutas de categorías
        loadChildren: () => import('./pages/categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
      },
      {
        path: 'products',  // 🆕 Para el futuro
        loadChildren: () => import('./pages/products/products.routes').then(m => m.PRODUCTS_ROUTES)
      },
      {
        path: 'inventory',  // 🆕 Para el futuro
        loadChildren: () => import('./pages/inventario/inventory.routes').then(m => m.INVENTORY_ROUTES)
      },
      /*
      {
        path: 'reports',  // 🆕 Para el futuro
        loadChildren: () => import('./pages/reports/reports.routes').then(m => m.REPORTS_ROUTES)
      }, */
      // Redirección por defecto
      { path: '', redirectTo: 'welcome', pathMatch: 'full' }
    ]
  },
  
  // 🔄 Redirecciones principales
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];