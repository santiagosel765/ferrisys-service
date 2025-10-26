// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { ModuleGuard } from './core/guards/module.guard';

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
        canActivate: [ModuleGuard],
        data: { module: 'INVENTORY' },
        loadChildren: () => import('./pages/categories/categories.routes').then(m => m.CATEGORIES_ROUTES)
      },
      {
        path: 'products',  // 🆕 Para el futuro
        canActivate: [ModuleGuard],
        data: { module: 'INVENTORY' },
        loadChildren: () => import('./pages/products/products.routes').then(m => m.PRODUCTS_ROUTES)
      },
      {
        path: 'inventory',  // 🆕 Para el futuro
        canActivate: [ModuleGuard],
        data: { module: 'INVENTORY' },
        loadChildren: () => import('./pages/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES)
      },
      {
        path: 'client',
        canActivate: [ModuleGuard],
        data: { module: 'CLIENT' },
        loadChildren: () => import('./pages/client/client.routes').then(m => m.CLIENT_ROUTES)
      },
      {
        path: 'provider',
        canActivate: [ModuleGuard],
        data: { module: 'PROVIDER' },
        loadChildren: () => import('./pages/provider/provider.routes').then(m => m.PROVIDER_ROUTES)
      },
      {
        path: 'quote',
        canActivate: [ModuleGuard],
        data: { module: 'QUOTE' },
        loadChildren: () => import('./pages/quote/quote.routes').then(m => m.QUOTE_ROUTES)
      },
      {
        path: 'purchase',
        canActivate: [ModuleGuard],
        data: { module: 'PURCHASE' },
        loadChildren: () => import('./pages/purchase/purchase.routes').then(m => m.PURCHASE_ROUTES)
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