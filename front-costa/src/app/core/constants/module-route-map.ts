export const MODULE_ALIAS: Record<string, string> = {
  CLIENTS: 'CLIENT',
  SUPPLIERS: 'PROVIDER',
  PROVIDERS: 'PROVIDER',
  QUOTES: 'QUOTE',
  PURCHASES: 'PURCHASE',
  PURCHASE_ORDERS: 'PURCHASE',
  PRODUCTS: 'PRODUCT',
  CATEGORIES: 'CATEGORY',
  INVENTORIES: 'INVENTORY',
};

export const MODULE_ROUTE_MAP: Record<string, string> = {
  INVENTORY: '/main/inventory',
  PRODUCT: '/main/products',
  CATEGORY: '/main/categories',
  CLIENT: '/main/clients',
  PROVIDER: '/main/providers',
  QUOTE: '/main/quotes',
  PURCHASE: '/main/purchases',
};

export const MODULE_LABEL_MAP: Record<string, string> = {
  INVENTORY: 'Inventario',
  PRODUCT: 'Productos',
  CATEGORY: 'Categorías',
  CLIENT: 'Clientes',
  PROVIDER: 'Proveedores',
  QUOTE: 'Cotizaciones',
  PURCHASE: 'Compras',
};

export const MODULE_ICON_MAP: Record<string, string> = {
  INVENTORY: 'database',
  PRODUCT: 'shopping',
  CATEGORY: 'tags',
  CLIENT: 'team',
  PROVIDER: 'contacts',
  QUOTE: 'file-search',
  PURCHASE: 'shopping-cart',
};

export function normalizeModuleName(name?: string | null): string | undefined {
  if (!name) {
    return undefined;
  }

  const key = name.trim().toUpperCase();
  return MODULE_ALIAS[key] ?? key;
}
