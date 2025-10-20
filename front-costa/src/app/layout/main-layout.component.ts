// src/app/layouts/main-layout/main-layout.component.ts
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NzIconModule, NzLayoutModule, NzMenuModule],
  template: `
    <nz-layout class="app-layout">
  <nz-sider class="menu-sidebar"
    nzCollapsible
    nzWidth="256px"
    nzBreakpoint="md"
    [(nzCollapsed)]="isCollapsed"
    [nzTrigger]="null"
  >
    <div class="sidebar-logo">
      <div class="logo-content">
        <img src="assets/images/logoferre.png" alt="logo">
        <h1 [class.hidden]="isCollapsed">Qbit-SasS</h1>
      </div>
    </div>
    
    <ul nz-menu nzTheme="dark" nzMode="inline" [nzInlineCollapsed]="isCollapsed">
      
      <!-- 📊 PANEL PRINCIPAL -->
      <li nz-submenu nzOpen nzTitle="Panel Principal" nzIcon="dashboard">
        <ul>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/welcome">
              <nz-icon nzType="home"></nz-icon>
              <span>Bienvenido</span>
            </a>
          </li>
        </ul>
      </li>

      <!-- 📦 GESTIÓN DE INVENTARIO -->
      <li nz-submenu nzTitle="Gestión de Inventario" nzIcon="shop">
        <ul>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/categories/panel">
              <nz-icon nzType="tags"></nz-icon>
              <span>Categorías</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/products/panel">
              <nz-icon nzType="shopping"></nz-icon>
              <span>Productos</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/inventory/panel">
              <nz-icon nzType="database"></nz-icon>
              <span>Inventario</span>
            </a>
          </li>
        </ul>
      </li>

      <!-- 🏢 ADMINISTRACIÓN -->
      <li nz-submenu nzTitle="Administración" nzIcon="setting">
        <ul>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/companies/panel">
              <nz-icon nzType="bank"></nz-icon>
              <span>Empresas</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/users/panel">
              <nz-icon nzType="team"></nz-icon>
              <span>Usuarios</span>
            </a>
          </li>
        </ul>
      </li>

      <!-- 📈 REPORTES Y ANÁLISIS -->
      <li nz-submenu nzTitle="Reportes y Análisis" nzIcon="bar-chart">
        <ul>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/reports/sales">
              <nz-icon nzType="line-chart"></nz-icon>
              <span>Reportes de Ventas</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/reports/shipments">
              <nz-icon nzType="car"></nz-icon>
              <span>Reportes de Envíos</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/reports/supplier-requests">
              <nz-icon nzType="interaction"></nz-icon>
              <span>Solicitudes a Proveedores</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/reports/client-quotes">
              <nz-icon nzType="file-text"></nz-icon>
              <span>Clientes Cotizados</span>
            </a>
          </li>
        </ul>
      </li>

      <!-- 💼 VENTAS Y OPERACIONES -->
      <li nz-submenu nzTitle="Ventas y Operaciones" nzIcon="dollar">
        <ul>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/sales/new">
              <nz-icon nzType="plus-circle"></nz-icon>
              <span>Nueva Venta</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/sales/history">
              <nz-icon nzType="history"></nz-icon>
              <span>Historial de Ventas</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/quotes/panel">
              <nz-icon nzType="file-search"></nz-icon>
              <span>Cotizaciones</span>
            </a>
          </li>
        </ul>
      </li>

      <!-- 📋 PROVEEDORES -->
      <li nz-submenu nzTitle="Proveedores" nzIcon="contacts">
        <ul>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/suppliers/panel">
              <nz-icon nzType="user"></nz-icon>
              <span>Lista de Proveedores</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/purchase-orders/panel">
              <nz-icon nzType="shopping-cart"></nz-icon>
              <span>Órdenes de Compra</span>
            </a>
          </li>
        </ul>
      </li>

      <!-- Separador visual -->
      <li nz-menu-divider></li>

      <!-- 🔧 CONFIGURACIÓN -->
      <li nz-submenu nzTitle="Configuración" nzIcon="tool">
        <ul>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/settings/profile">
              <nz-icon nzType="user"></nz-icon>
              <span>Mi Perfil</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/settings/company">
              <nz-icon nzType="bank"></nz-icon>
              <span>Configuración General</span>
            </a>
          </li>
          <li nz-menu-item nzMatchRouter>
            <a routerLink="/main/settings/backup">
              <nz-icon nzType="cloud-download"></nz-icon>
              <span>Respaldos</span>
            </a>
          </li>
        </ul>
      </li>

      <li nz-menu-item nzMatchRouter class="container-logout">
          
          <a href="/logout">
            <nz-icon nzType="logout" nzTheme="outline" />  
            <span>Cerrar Sesión</span>
          </a>
      </li>

    </ul>

    
  </nz-sider>

  <nz-layout class="layout-container">
    <nz-header>
      <div class="app-header">
        <div class="header-left">
          <span class="header-trigger" (click)="isCollapsed = !isCollapsed">
            <nz-icon class="trigger" [nzType]="isCollapsed ? 'menu-unfold' : 'menu-fold'" />
          </span>
          
          <!-- Breadcrumb opcional -->
          <div class="breadcrumb-section">
            <span class="current-section"></span>
          </div>
        </div>
        
      </div>
    </nz-header>

    <nz-content>
      <div class="inner-content">
        <router-outlet></router-outlet>
      </div>
    </nz-content>
  </nz-layout>
</nz-layout>
  `,
  styles: [`
    :host {
  display: flex;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-layout {
  height: 100vh;
}

.menu-sidebar {
  position: relative;
  z-index: 10;
  min-height: 100vh;
  box-shadow: 2px 0 6px rgba(0,21,41,.35);
}

.header-trigger {
  height: 64px;
  padding: 20px 24px;
  font-size: 20px;
  cursor: pointer;
  transition: all .3s,padding 0s;
}

.ant-menu-dark.ant-menu-dark:not(.ant-menu-horizontal) .ant-menu-item-selected {

}

.trigger:hover {
  color: #004cff;
}

.sidebar-logo {
  position: relative;
  height: 64px;
  padding-left: 24px;
  overflow: hidden;
  line-height: 64px;
  background: #031425;
  transition: all .3s;
}

.ant-menu.ant-menu-dark{
  color: #fff !important;
}

.sidebar-logo img {
  display: inline-block;
  height: 32px;
  width: 32px;
  vertical-align: middle;
}

.ant-menu-title-content {
    transition: color .0s !important;
}

.ant-menu-dark .ant-menu-item:hover,li.ant-menu-item.ant-menu-item-selected{
  background-color: #0077f7 !important;
}

.container-logout.ant-menu-item, .container-logout.ant-menu-item a{
  color: #fff !important;
}

.layout-container{
  overflow: overlay;
}

.btn-logout{
  background-color: #fff;
}
.btn-logout:hover{
  background-color: #fff !important;
  font-weight: 600;
}

.sidebar-logo h1 {
  display: inline-block;
  margin: 0 0 0 20px;
  color: #fff;
  font-weight: 600;
  font-size: 14px;
  font-family: Avenir,Helvetica Neue,Arial,Helvetica,sans-serif;
  vertical-align: middle;
}

nz-header {
  padding: 0;
  width: 100%;
  z-index: 2;
}

.app-header {
  position: relative;
  height: 64px;
  padding: 0;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,21,41,.08);
}

nz-content {
  margin: 24px;
}

.inner-content {
  background: #fff;
  height: 100%;
}

  `],

})
export class MainLayoutComponent {
  isCollapsed = false;

  logout(): void {
    // Aquí implementarías la lógica de logout
    // Por ejemplo: this.authService.logout(); this.router.navigate(['/login']);
    console.log('Cerrando sesión...');
  }
}