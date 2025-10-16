# 🔐 Sistema de Roles y Guards

Este documento explica cómo funciona el sistema de autorización basado en roles.

## 📋 Roles Disponibles

```typescript
export enum UserRole {
  USER = 'user',        // Usuario estándar con permisos básicos
  JEFATURA = 'jefatura' // Administrador con privilegios elevados
}
```

## 🛡️ Guards Implementados

### 1. **JwtAuthGuard**
Verifica que el usuario esté autenticado (tiene un JWT válido).

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile() {
  // Solo usuarios autenticados
}
```

### 2. **RolesGuard**
Verifica que el usuario autenticado tenga el rol requerido.

**IMPORTANTE:** Siempre usar `JwtAuthGuard` ANTES de `RolesGuard`.

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.JEFATURA)
@Get('admin-panel')
getAdminPanel() {
  // Solo usuarios con rol JEFATURA
}
```

## 🎯 Ejemplos de Uso

### Endpoint Público (Sin autenticación)
```typescript
@Post('auth/request-login')
requestLogin(@Body() dto: RequestLoginDto) {
  // Cualquiera puede acceder
}
```

### Endpoint Protegido (Requiere autenticación)
```typescript
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('access-token')
@Get('users/:id')
getUser(@Param('id') id: string) {
  // Cualquier usuario autenticado puede acceder
}
```

### Endpoint Solo para JEFATURA
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.JEFATURA)
@ApiBearerAuth('access-token')
@ApiOperation({ 
  summary: 'Listar todos los usuarios',
  description: '⚠️ Solo accesible por usuarios con rol JEFATURA'
})
@ApiForbiddenResponse({ 
  description: 'No tienes permisos para acceder a este recurso' 
})
@Get('users')
listAllUsers() {
  // Solo usuarios con rol JEFATURA
}
```

### Múltiples Roles Permitidos
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.JEFATURA, UserRole.USER)
@Get('reports')
getReports() {
  // Usuarios con rol JEFATURA o USER pueden acceder
}
```

## 📝 JWT Payload

El token JWT incluye el rol del usuario:

```json
{
  "email": "user@ejemplo.com",
  "sub": "uuid-del-usuario",
  "role": "user",
  "iat": 1729108800,
  "exp": 1729713600
}
```

## 🚫 Manejo de Errores

### Usuario no autenticado (401 Unauthorized)
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### Usuario sin permisos (403 Forbidden)
```json
{
  "statusCode": 403,
  "message": "Se requiere uno de los siguientes roles: jefatura"
}
```

## 🔧 Cómo Cambiar el Rol de un Usuario

### Opción 1: Manualmente en la base de datos
```sql
UPDATE users 
SET role = 'jefatura' 
WHERE email = 'admin@ejemplo.com';
```

### Opción 2: Crear un endpoint (recomendado)
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.JEFATURA)
@Patch('users/:id/role')
async updateUserRole(
  @Param('id') id: string,
  @Body() { role }: { role: UserRole }
) {
  return this.usersService.updateUserRole(id, role);
}
```

## 📊 Flujo de Autorización

```
1. Cliente → Request con JWT Bearer Token
2. JwtAuthGuard → Valida el token
3. JWT Strategy → Obtiene usuario de la BD
4. RolesGuard → Verifica el rol del usuario
5. Si todo OK → Ejecuta el endpoint
6. Si falla → Retorna 401 o 403
```

## ✅ Endpoints del Sistema

### Auth (Públicos)
- `POST /auth/request-login` - ✅ Público
- `GET /auth/verify-login` - ✅ Público

### Users
- `GET /users` - 🔒 Solo JEFATURA
- `GET /users/:id` - 🔓 Autenticado
- `POST /users` - 🔒 Solo JEFATURA
- `PATCH /users/:id` - 🔒 Solo JEFATURA
- `DELETE /users/:id` - 🔒 Solo JEFATURA

### Leyenda:
- ✅ Público - Sin autenticación
- 🔓 Autenticado - Requiere JWT
- 🔒 Restringido - Requiere JWT + Rol específico

## 🧪 Testing en Swagger

1. Obtén un JWT haciendo login
2. Haz clic en "Authorize" en Swagger
3. Ingresa: `Bearer tu-jwt-token`
4. Prueba endpoints protegidos

**Para probar endpoints de JEFATURA:**
- Cambia el rol del usuario en la BD a `'jefatura'`
- Genera un nuevo JWT (login nuevamente)
- Usa ese nuevo token con el rol actualizado

## 🔐 Seguridad

✅ **Roles incluidos en JWT** - No se puede falsificar
✅ **Validación en cada request** - Guard verifica en tiempo real
✅ **Usuario debe estar activo** - JWT Strategy valida `isActive`
✅ **Usuarios inactivos rechazados** - Aunque tengan JWT válido

## 📚 Decoradores Swagger

Siempre documenta endpoints protegidos:

```typescript
@ApiBearerAuth('access-token')  // Indica que requiere JWT
@ApiOperation({ 
  summary: 'Título',
  description: '⚠️ Solo accesible por usuarios con rol JEFATURA'
})
@ApiForbiddenResponse({ 
  description: 'No tienes permisos para acceder a este recurso' 
})
```

## 🎓 Mejores Prácticas

1. ✅ Siempre usa `JwtAuthGuard` antes de `RolesGuard`
2. ✅ Documenta endpoints restringidos con `@ApiBearerAuth`
3. ✅ Usa mensajes claros en `@ApiOperation` description
4. ✅ Incluye `@ApiForbiddenResponse` en endpoints restringidos
5. ✅ Agrupa decoradores de guards juntos
6. ✅ Coloca el decorador `@Roles()` después de `@UseGuards()`

## ❌ Errores Comunes

### ❌ INCORRECTO: RolesGuard sin JwtAuthGuard
```typescript
@UseGuards(RolesGuard)  // ❌ No funcionará
@Roles(UserRole.JEFATURA)
```

### ✅ CORRECTO: Ambos guards en orden
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)  // ✅ Orden correcto
@Roles(UserRole.JEFATURA)
```

### ❌ INCORRECTO: Decorador @Roles antes de @UseGuards
```typescript
@Roles(UserRole.JEFATURA)  // ❌ Orden incorrecto
@UseGuards(JwtAuthGuard, RolesGuard)
```

### ✅ CORRECTO: @UseGuards primero, luego @Roles
```typescript
@UseGuards(JwtAuthGuard, RolesGuard)  // ✅ Orden correcto
@Roles(UserRole.JEFATURA)
```
