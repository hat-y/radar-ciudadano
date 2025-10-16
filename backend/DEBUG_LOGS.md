# 🔍 DEBUG LOGS - Sistema de Autenticación

Este documento explica los logs de debug que verás en el backend para el flujo de autenticación.

## 📩 REQUEST LOGIN - Solicitud de Magic Link

Cuando un usuario solicita login (`POST /auth/request-login`):

```
================================================================================
📩 REQUEST LOGIN
Email solicitado: user@example.com
Timestamp: 2025-10-16T19:30:00.000Z
➕ Creando nuevo usuario: user@example.com  (o 👤 Usuario existente)
✅ Usuario creado con ID: uuid-xxxxx
🔑 Token generado: a1b2c3d4e5f6789...
🔑 Token length: 64
⏰ Token expira en: 2025-10-16T19:45:00.000Z
🔗 Magic Link generado para: user@example.com
🔗 Link completo: http://localhost:5173/auth/verify?token=a1b2c3d4e5f6789...
✉️ Email enviado a: user@example.com
================================================================================
```

## 🔐 VERIFY LOGIN - Verificación del Token

Cuando el usuario hace clic en el magic link (`GET /auth/verify-login?token=xxx`):

### En el Controller:
```
🔍 GET /auth/verify-login - Token recibido en controller
Token completo: a1b2c3d4e5f6789...
Query params raw: {"token":"a1b2c3d4e5f6789..."}
```

### En el Service:
```
================================================================================
🔐 VERIFY LOGIN - Token recibido
Token: a1b2c3d4e5f6789...
Token length: 64
Timestamp: 2025-10-16T19:35:00.000Z
================================================================================
✅ Usuario encontrado: user@example.com (ID: uuid-xxxxx)
Email verificado: false
Token expira: 2025-10-16T19:45:00.000Z
📧 Verificando email para usuario: user@example.com
🗑️ Token limpiado para usuario: user@example.com
🎉 Login exitoso para: user@example.com
================================================================================
```

## ⚠️ Errores Comunes

### Token Inválido:
```
❌ Token inválido o no encontrado: a1b2c3d4e5f6789...
```

### Token Expirado:
```
⏰ Token expirado para usuario: user@example.com
```

### Error General:
```
❌ Error en requestLogin: [mensaje del error]
```

## 🎯 Flujo de Seguridad

1. **Usuario NO puede obtener JWT sin hacer clic en el magic link**
   - El token se genera y guarda en la BD
   - Solo el endpoint `/auth/verify-login` con token válido retorna JWT
   - El token se elimina después de usarse (single-use)

2. **Usuario creado pero NO verificado**
   - `emailVerified: false` cuando se crea
   - `emailVerified: true` solo después de hacer clic en el link

3. **Token de un solo uso**
   - Después de verificar, el token se limpia (`loginToken: null`)
   - No se puede reutilizar el mismo link

## 📊 Niveles de Log

- `logger.log()` - Eventos importantes (creación de usuario, login exitoso)
- `logger.debug()` - Información detallada (tokens, timestamps, IDs)
- `logger.warn()` - Advertencias (token expirado, token inválido)
- `logger.error()` - Errores (fallos en la operación)

## 🔧 Activar/Desactivar Logs

Para ver TODOS los logs de debug en desarrollo, asegúrate de que `NODE_ENV=development` en tu `.env`.

En producción, solo se mostrarán logs de nivel `log`, `warn` y `error`.
