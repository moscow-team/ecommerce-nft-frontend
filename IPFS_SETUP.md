# Configuración de IPFS con Web3.Storage (w3up-client)

## Migración de web3.storage deprecado

Hemos migrado de `web3.storage` (deprecado) a `@web3-storage/w3up-client` (la nueva implementación).

## Configuración Requerida

### 1. Instalación de dependencias

Las dependencias ya están instaladas:
- `@web3-storage/w3up-client`: Cliente moderno para Web3.Storage

### 2. Autenticación

El nuevo cliente requiere autenticación. Hay varias opciones:

#### Opción A: Para desarrollo/pruebas
```bash
# Instalar la CLI de w3
npm install -g @web3-storage/w3cli

# Autenticarse
w3 login your-email@example.com

# Crear un espacio
w3 space create your-project-name

# Usar el espacio
w3 space use
```

#### Opción B: Para producción
Necesitarás configurar la autenticación programáticamente o usar variables de entorno con las credenciales apropiadas.

### 3. Variables de entorno (si es necesario)

Agrega a tu `.env.local`:
```
# Ya no se necesita NEXT_PUBLIC_WEB3_STORAGE_TOKEN para el nuevo cliente
# El nuevo cliente maneja la autenticación de manera diferente
```

## Cambios en la API

### Antes (web3.storage - deprecado):
```typescript
import { Web3Storage } from 'web3.storage';
const client = new Web3Storage({ token: 'tu-token' });
const cid = await client.put([file]);
```

### Ahora (@web3-storage/w3up-client):
```typescript
import * as Client from '@web3-storage/w3up-client';
const client = await Client.create();
const cid = await client.uploadFile(file);
```

## Funcionalidad actual

El hook `useIPFS` ahora incluye:

- ✅ Inicialización automática del cliente
- ✅ Subida de archivos
- ✅ Subida de metadata JSON
- ✅ Resolución de CIDs
- ✅ Manejo de errores mejorado
- ⚠️ Autenticación (requiere configuración adicional)

## Próximos pasos

1. Configurar la autenticación según el método elegido
2. Probar las funciones de subida
3. Opcionalmente, implementar autenticación programática para producción

## Notas

- El cliente nuevo es más seguro y eficiente
- Requiere autenticación explícita (no solo un token)
- Soporta mejores funciones de gestión de espacios
- Es compatible con las últimas características de IPFS y Web3.Storage
