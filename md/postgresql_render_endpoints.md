# 🗄️ PostgreSQL, Render y Endpoints: Guía Detallada

## 📋 Índice
1. [PostgreSQL: La Base de Datos](#postgresql-la-base-de-datos)
2. [Render: Hosting y Deployment](#render-hosting-y-deployment)
3. [Conexión Spring Boot ↔ PostgreSQL](#conexión-spring-boot--postgresql)
4. [Creación de Endpoints REST](#creación-de-endpoints-rest)
5. [Flujo Completo: Request → Database](#flujo-completo-request--database)

---

## 🗄️ PostgreSQL: La Base de Datos

### ¿Qué es PostgreSQL?

PostgreSQL es un **sistema de gestión de bases de datos relacional** (RDBMS) de código abierto. Es como un Excel súper potente que:
- Almacena datos en **tablas** con filas y columnas
- Garantiza **integridad** de datos (no duplicados, relaciones válidas)
- Soporta **transacciones** (todo o nada)
- Es **escalable** (millones de registros)

### Estructura de Nuestra Base de Datos

```
portfolio_db (Base de Datos)
│
├── users (Tabla)
│   ├── id (BIGSERIAL PRIMARY KEY)
│   ├── name (VARCHAR)
│   ├── email (VARCHAR UNIQUE)
│   ├── password (VARCHAR)
│   ├── role (VARCHAR)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
│
├── programmer_profiles (Tabla)
│   ├── id (BIGSERIAL PRIMARY KEY)
│   ├── user_id (BIGINT UNIQUE) → FK a users.id
│   ├── job_title (VARCHAR)
│   ├── bio (TEXT)
│   ├── image_url (VARCHAR)
│   ├── github_url (VARCHAR)
│   ├── linkedin_url (VARCHAR)
│   ├── instagram_url (VARCHAR)
│   ├── whatsapp_url (VARCHAR)
│   ├── years_experience (INTEGER)
│   ├── rating (DOUBLE PRECISION)
│   ├── created_at (TIMESTAMP)
│   └── updated_at (TIMESTAMP)
│
└── programmer_skills (Tabla)
    ├── profile_id (BIGINT) → FK a programmer_profiles.id
    └── skill (VARCHAR)
```

### Tipos de Datos PostgreSQL

| Tipo Java | Tipo PostgreSQL | Descripción |
|-----------|----------------|-------------|
| `Long` | `BIGSERIAL` | Número entero auto-incremental (1, 2, 3...) |
| `String` | `VARCHAR(255)` | Texto corto (hasta 255 caracteres) |
| `String` | `TEXT` | Texto largo (sin límite) |
| `Integer` | `INTEGER` | Número entero (-2B a +2B) |
| `Double` | `DOUBLE PRECISION` | Número decimal |
| `LocalDateTime` | `TIMESTAMP` | Fecha y hora |

### Relaciones en PostgreSQL

#### 1. OneToOne (Uno a Uno)
```
users                    programmer_profiles
┌────┬───────┐          ┌────┬─────────┬──────────┐
│ id │ email │          │ id │ user_id │ job_title│
├────┼───────┤          ├────┼─────────┼──────────┤
│ 1  │ alex@ │◄─────────┤ 1  │    1    │ Full St. │
│ 2  │ juan@ │          │ 2  │    2    │ Backend  │
└────┴───────┘          └────┴─────────┴──────────┘
```
- Un usuario tiene **UN SOLO** perfil
- Un perfil pertenece a **UN SOLO** usuario
- `user_id` es **UNIQUE** (no puede repetirse)

#### 2. OneToMany (Uno a Muchos)
```
programmer_profiles              programmer_skills
┌────┬──────────┐                ┌────────────┬───────────┐
│ id │ job_title│                │ profile_id │   skill   │
├────┼──────────┤                ├────────────┼───────────┤
│ 1  │ Full St. │◄───────────────┤     1      │   Java    │
│    │          │◄───────────────┤     1      │   Spring  │
│    │          │◄───────────────┤     1      │   React   │
│ 2  │ Backend  │◄───────────────┤     2      │   Python  │
└────┴──────────┘                └────────────┴───────────┘
```
- Un perfil tiene **MUCHAS** habilidades
- Cada habilidad pertenece a **UN** perfil

### SQL Generado Automáticamente por JPA

Cuando ejecutas la aplicación Spring Boot por primera vez, **Hibernate** (JPA) genera automáticamente estas tablas:

```sql
-- Tabla users
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Tabla programmer_profiles
CREATE TABLE programmer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    job_title VARCHAR(255),
    bio TEXT,
    image_url VARCHAR(500),
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    instagram_url VARCHAR(500),
    whatsapp_url VARCHAR(500),
    years_experience INTEGER,
    rating DOUBLE PRECISION,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Tabla programmer_skills
CREATE TABLE programmer_skills (
    profile_id BIGINT NOT NULL,
    skill VARCHAR(255),
    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES programmer_profiles(id) ON DELETE CASCADE
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_profile_user_id ON programmer_profiles(user_id);
```

**¿Cómo lo hace?**
1. Lee las anotaciones `@Entity`, `@Table`, `@Column`
2. Mapea tipos Java → PostgreSQL
3. Crea constraints (UNIQUE, NOT NULL, FK)
4. Genera índices automáticos

---

## 🚀 Render: Hosting y Deployment

### ¿Qué es Render?

Render es una **plataforma de hosting** que permite:
- ✅ Desplegar aplicaciones web (Spring Boot)
- ✅ Crear bases de datos PostgreSQL
- ✅ Configurar variables de entorno
- ✅ Auto-deploy desde GitHub
- ✅ HTTPS automático

### Paso 1: Crear Base de Datos PostgreSQL en Render

#### 1.1. Acceder a Render Dashboard
```
https://dashboard.render.com
```

#### 1.2. Crear Nueva Base de Datos
```
New → PostgreSQL
```

**Configuración:**
```
Name: portfolio-db
Database: portfolio_db
User: portfolio_user
Region: Oregon (US West)
PostgreSQL Version: 16
Plan: Free
```

#### 1.3. Render Genera Automáticamente:

**Internal Database URL** (para conexiones dentro de Render):
```
postgresql://portfolio_user:password@dpg-xxx-a.oregon-postgres.render.com/portfolio_db
```

**External Database URL** (para conexiones externas):
```
postgresql://portfolio_user:password@dpg-xxx-a.oregon-postgres.render.com:5432/portfolio_db
```

**Credenciales:**
```
Host: dpg-xxx-a.oregon-postgres.render.com
Port: 5432
Database: portfolio_db
Username: portfolio_user
Password: [generado automáticamente]
```

### Paso 2: Desplegar Spring Boot en Render

#### 2.1. Crear Web Service
```
New → Web Service
Connect Repository: AlexChuquipoma/Backend-Spring
```

#### 2.2. Configuración del Servicio

**Build Settings:**
```
Name: backend-spring
Environment: Java
Build Command: ./mvnw clean package -DskipTests
Start Command: java -jar target/backend-0.0.1-SNAPSHOT.jar
```

**¿Qué hace cada comando?**

**Build Command:**
```bash
./mvnw clean package -DskipTests
```
- `./mvnw`: Maven Wrapper (no necesita Maven instalado)
- `clean`: Elimina archivos compilados anteriores
- `package`: Compila y empaqueta en un archivo `.jar`
- `-DskipTests`: Omite tests (más rápido)

**Resultado:** `target/backend-0.0.1-SNAPSHOT.jar` (archivo ejecutable)

**Start Command:**
```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```
- `java -jar`: Ejecuta el archivo JAR
- Spring Boot inicia en el puerto `8080`

#### 2.3. Variables de Entorno

En Render Dashboard → Environment:

```
DATABASE_URL=jdbc:postgresql://dpg-xxx.oregon-postgres.render.com:5432/portfolio_db
DATABASE_USERNAME=portfolio_user
DATABASE_PASSWORD=xxx
JWT_SECRET=your-secret-key-here
```

**¿Por qué variables de entorno?**
- 🔒 **Seguridad:** No exponer credenciales en el código
- 🔄 **Flexibilidad:** Cambiar sin recompilar
- 🌍 **Múltiples entornos:** Dev, staging, production

#### 2.4. Auto-Deploy desde GitHub

```
Auto-Deploy: Yes
Branch: main
```

**Flujo:**
```
1. Haces commit en GitHub
2. Render detecta cambios
3. Ejecuta build automáticamente
4. Despliega nueva versión
5. URL actualizada: https://backend-spring-wgjc.onrender.com
```

---

## 🔗 Conexión Spring Boot ↔ PostgreSQL

### application.properties

```properties
# Database Configuration
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA/Hibernate Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.format_sql=true

# JWT Configuration
jwt.secret=${JWT_SECRET}
jwt.expiration=86400000

# Server
server.port=8080
```

### ¿Qué hace cada configuración?

#### 1. `spring.datasource.url`
```
jdbc:postgresql://host:5432/database
```
- `jdbc:postgresql://`: Protocolo de conexión
- `host`: Dirección del servidor PostgreSQL
- `5432`: Puerto estándar de PostgreSQL
- `database`: Nombre de la base de datos

#### 2. `spring.jpa.hibernate.ddl-auto=update`

Opciones:
- `create`: Elimina y recrea tablas cada vez (⚠️ PELIGROSO)
- `create-drop`: Crea al iniciar, elimina al cerrar
- `update`: **Actualiza tablas sin eliminar datos** ✅
- `validate`: Solo valida, no modifica
- `none`: No hace nada

**Recomendado:** `update` en desarrollo, `validate` en producción

#### 3. `spring.jpa.show-sql=true`
Muestra SQL en consola:
```sql
Hibernate: INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)
```

#### 4. `spring.jpa.properties.hibernate.dialect`
Le dice a Hibernate qué "dialecto" de SQL usar:
- PostgreSQL tiene funciones específicas (`SERIAL`, `TEXT`, etc.)
- MySQL usa sintaxis diferente
- Oracle tiene sus propias peculiaridades

### Conexión en Acción

**Cuando Spring Boot inicia:**

```
1. Lee application.properties
   ↓
2. Carga driver PostgreSQL (org.postgresql.Driver)
   ↓
3. Establece conexión con BD
   ↓
4. Hibernate escanea @Entity
   ↓
5. Compara entidades con tablas existentes
   ↓
6. Si no existen: CREATE TABLE
   Si existen pero diferentes: ALTER TABLE
   ↓
7. Aplicación lista para recibir requests
```

**Log de consola:**
```
2026-02-08 00:00:00.000  INFO --- [main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Starting...
2026-02-08 00:00:00.100  INFO --- [main] com.zaxxer.hikari.HikariDataSource       : HikariPool-1 - Start completed.
2026-02-08 00:00:00.200  INFO --- [main] org.hibernate.dialect.Dialect            : HHH000400: Using dialect: org.hibernate.dialect.PostgreSQLDialect
2026-02-08 00:00:00.500  INFO --- [main] o.h.e.t.j.p.i.JtaPlatformInitiator       : HHH000490: Using JtaPlatform implementation: [org.hibernate.engine.transaction.jta.platform.internal.NoJtaPlatform]
2026-02-08 00:00:01.000  INFO --- [main] o.s.b.w.embedded.tomcat.TomcatWebServer  : Tomcat started on port(s): 8080 (http)
```

---

## 🛠️ Creación de Endpoints REST

### ¿Qué es un Endpoint?

Un **endpoint** es una URL específica que realiza una acción:

```
GET    /api/profiles/me           → Obtener mi perfil
POST   /api/profiles              → Crear perfil
PUT    /api/profiles              → Actualizar perfil
DELETE /api/profiles              → Eliminar perfil
GET    /api/profiles/user/5       → Ver perfil del usuario 5
```

### Anatomía de un Endpoint

```java
@GetMapping("/api/profiles/me")
public ResponseEntity<ProgrammerProfileDTO> getMyProfile(Authentication auth) {
    // Lógica aquí
}
```

**Componentes:**
1. **Método HTTP:** `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
2. **Ruta:** `/api/profiles/me`
3. **Parámetros:** `Authentication auth`, `@RequestBody`, `@PathVariable`
4. **Tipo de retorno:** `ResponseEntity<ProgrammerProfileDTO>`

### Paso a Paso: Crear un Endpoint

#### Paso 1: Definir la Ruta en el Controller

```java
@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "*")
public class ProgrammerProfileController {
    
    private final ProgrammerProfileService profileService;
    
    // Constructor (inyección de dependencias)
    public ProgrammerProfileController(ProgrammerProfileService profileService) {
        this.profileService = profileService;
    }
}
```

**Anotaciones:**
- `@RestController`: Marca como controlador REST (respuestas JSON automáticas)
- `@RequestMapping("/api/profiles")`: Prefijo base para todos los endpoints
- `@CrossOrigin(origins = "*")`: Permite peticiones desde cualquier dominio

#### Paso 2: Crear Endpoint GET

```java
@GetMapping("/me")
public ResponseEntity<ProgrammerProfileDTO> getMyProfile(Authentication authentication) {
    // 1. Extraer email del usuario autenticado (viene del JWT)
    String userEmail = authentication.getName();
    
    // 2. Llamar al servicio para obtener el perfil
    ProgrammerProfileDTO profile = profileService.getMyProfile(userEmail);
    
    // 3. Retornar respuesta HTTP 200 OK con el perfil en JSON
    return ResponseEntity.ok(profile);
}
```

**URL completa:** `GET /api/profiles/me`

**¿Qué hace cada parte?**

1. **`@GetMapping("/me")`**
   - Mapea peticiones GET a `/api/profiles/me`
   - Spring detecta automáticamente el método HTTP

2. **`Authentication authentication`**
   - Spring Security lo inyecta automáticamente
   - Contiene información del usuario autenticado
   - `authentication.getName()` retorna el email del JWT

3. **`ResponseEntity.ok(profile)`**
   - Crea respuesta HTTP 200 OK
   - Convierte `profile` a JSON automáticamente
   - Agrega headers: `Content-Type: application/json`

#### Paso 3: Crear Endpoint POST

```java
@PostMapping
public ResponseEntity<ProgrammerProfileDTO> createOrUpdateProfile(
        @RequestBody UpdateProfileRequest request,
        Authentication authentication) {
    
    // 1. Extraer email del JWT
    String userEmail = authentication.getName();
    
    // 2. Llamar al servicio
    ProgrammerProfileDTO profile = profileService.createOrUpdateProfile(userEmail, request);
    
    // 3. Retornar HTTP 200 OK
    return ResponseEntity.ok(profile);
}
```

**URL completa:** `POST /api/profiles`

**`@RequestBody UpdateProfileRequest request`:**
- Spring deserializa JSON automáticamente a objeto Java
- Ejemplo de JSON:
```json
{
  "jobTitle": "Full Stack Developer",
  "bio": "Passionate developer...",
  "skills": ["Java", "Spring Boot"]
}
```
- Se convierte a:
```java
UpdateProfileRequest {
    jobTitle = "Full Stack Developer"
    bio = "Passionate developer..."
    skills = ["Java", "Spring Boot"]
}
```

#### Paso 4: Crear Endpoint con Path Variable

```java
@GetMapping("/user/{userId}")
public ResponseEntity<ProgrammerProfileDTO> getProfileByUserId(@PathVariable Long userId) {
    ProgrammerProfileDTO profile = profileService.getProfileByUserId(userId);
    return ResponseEntity.ok(profile);
}
```

**URL completa:** `GET /api/profiles/user/5`

**`@PathVariable Long userId`:**
- Extrae `5` de la URL
- Lo convierte a `Long userId = 5L`

#### Paso 5: Crear Endpoint DELETE

```java
@DeleteMapping
public ResponseEntity<Void> deleteProfile(Authentication authentication) {
    String userEmail = authentication.getName();
    profileService.deleteProfile(userEmail);
    
    // HTTP 204 No Content (éxito sin cuerpo de respuesta)
    return ResponseEntity.noContent().build();
}
```

**URL completa:** `DELETE /api/profiles`

**`ResponseEntity<Void>`:**
- No retorna datos en el body
- Solo status code: `204 No Content`

---

## 📡 Flujo Completo: Request → Database

### Ejemplo: Crear Perfil

**1. Frontend hace petición:**
```typescript
fetch('https://backend-spring-wgjc.onrender.com/api/profiles', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer eyJhbGc...',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        jobTitle: 'Full Stack Developer',
        bio: 'Passionate developer...',
        skills: ['Java', 'Spring Boot', 'React']
    })
});
```

**2. Request HTTP viaja por internet:**
```http
POST /api/profiles HTTP/1.1
Host: backend-spring-wgjc.onrender.com
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "jobTitle": "Full Stack Developer",
  "bio": "Passionate developer...",
  "skills": ["Java", "Spring Boot", "React"]
}
```

**3. Spring Security intercepta (JwtAuthenticationFilter):**
```java
// Extraer token del header
String authHeader = request.getHeader("Authorization");
String jwt = authHeader.substring(7); // "eyJhbGc..."

// Validar token
String userEmail = jwtUtil.extractUsername(jwt); // "alexutfsx@gmail.com"

if (jwtUtil.isTokenValid(jwt, userDetails)) {
    // Crear objeto Authentication
    UsernamePasswordAuthenticationToken authToken = 
        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
    
    // Guardar en contexto de seguridad
    SecurityContextHolder.getContext().setAuthentication(authToken);
}
```

**4. Controller recibe la petición:**
```java
@PostMapping
public ResponseEntity<ProgrammerProfileDTO> createOrUpdateProfile(
        @RequestBody UpdateProfileRequest request,  // JSON → Objeto Java
        Authentication authentication) {            // Inyectado por Spring Security
    
    String userEmail = authentication.getName(); // "alexutfsx@gmail.com"
    
    ProgrammerProfileDTO profile = profileService.createOrUpdateProfile(userEmail, request);
    
    return ResponseEntity.ok(profile);
}
```

**5. Service ejecuta lógica de negocio:**
```java
@Transactional
public ProgrammerProfileDTO createOrUpdateProfile(String userEmail, UpdateProfileRequest request) {
    // Buscar usuario en BD
    User user = userRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("User not found"));
    
    // Validar rol
    if (user.getRole() != Role.PROGRAMMER) {
        throw new RuntimeException("Only PROGRAMMER role can create profiles");
    }
    
    // Buscar perfil existente o crear nuevo
    ProgrammerProfile profile = profileRepository.findByUser(user)
            .orElse(ProgrammerProfile.builder()
                    .user(user)
                    .rating(0.0)
                    .build());
    
    // Actualizar campos
    profile.setJobTitle(request.getJobTitle());
    profile.setBio(request.getBio());
    profile.setSkills(request.getSkills());
    
    // Guardar en BD
    ProgrammerProfile savedProfile = profileRepository.save(profile);
    
    // Convertir a DTO
    return convertToDTO(savedProfile);
}
```

**6. Repository interactúa con PostgreSQL:**
```java
// Spring Data JPA genera automáticamente:
profileRepository.save(profile);
```

**SQL generado por Hibernate:**
```sql
-- Si es nuevo perfil (INSERT)
INSERT INTO programmer_profiles (
    user_id, job_title, bio, rating, created_at, updated_at
) VALUES (
    2, 'Full Stack Developer', 'Passionate developer...', 0.0, NOW(), NOW()
) RETURNING id;

-- Insertar skills en tabla separada
INSERT INTO programmer_skills (profile_id, skill) VALUES (1, 'Java');
INSERT INTO programmer_skills (profile_id, skill) VALUES (1, 'Spring Boot');
INSERT INTO programmer_skills (profile_id, skill) VALUES (1, 'React');

-- Si ya existe (UPDATE)
UPDATE programmer_profiles 
SET job_title = 'Full Stack Developer',
    bio = 'Passionate developer...',
    updated_at = NOW()
WHERE id = 1;

DELETE FROM programmer_skills WHERE profile_id = 1;
INSERT INTO programmer_skills (profile_id, skill) VALUES (1, 'Java');
INSERT INTO programmer_skills (profile_id, skill) VALUES (1, 'Spring Boot');
INSERT INTO programmer_skills (profile_id, skill) VALUES (1, 'React');
```

**7. PostgreSQL ejecuta y retorna:**
```
INSERT 0 1
```

**8. Service convierte a DTO:**
```java
ProgrammerProfileDTO dto = ProgrammerProfileDTO.builder()
        .id(1L)
        .userId(2L)
        .userName("Alexander Chuquipoma")
        .userEmail("alexutfsx@gmail.com")
        .jobTitle("Full Stack Developer")
        .bio("Passionate developer...")
        .skills(Arrays.asList("Java", "Spring Boot", "React"))
        .rating(0.0)
        .createdAt(LocalDateTime.now())
        .updatedAt(LocalDateTime.now())
        .build();
```

**9. Controller retorna Response:**
```java
return ResponseEntity.ok(dto);
```

**HTTP Response:**
```http
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 345

{
  "id": 1,
  "userId": 2,
  "userName": "Alexander Chuquipoma",
  "userEmail": "alexutfsx@gmail.com",
  "jobTitle": "Full Stack Developer",
  "bio": "Passionate developer...",
  "skills": ["Java", "Spring Boot", "React"],
  "rating": 0.0,
  "createdAt": "2026-02-08T00:00:00",
  "updatedAt": "2026-02-08T00:00:00"
}
```

**10. Frontend recibe y procesa:**
```typescript
const profile = await response.json();
console.log(profile.jobTitle); // "Full Stack Developer"
alert('✅ Perfil guardado correctamente');
```

---

## 🔍 Verificar en PostgreSQL

### Conectarse a la Base de Datos

**Opción 1: Render Dashboard**
```
Dashboard → portfolio-db → Connect → PSQL Command
```

**Opción 2: Cliente local (DBeaver, pgAdmin)**
```
Host: dpg-xxx.oregon-postgres.render.com
Port: 5432
Database: portfolio_db
Username: portfolio_user
Password: xxx
```

### Queries SQL para Verificar

```sql
-- Ver todos los usuarios
SELECT * FROM users;

-- Ver todos los perfiles
SELECT * FROM programmer_profiles;

-- Ver skills de un perfil
SELECT * FROM programmer_skills WHERE profile_id = 1;

-- Ver perfil completo con usuario
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    p.job_title,
    p.bio,
    p.rating
FROM users u
LEFT JOIN programmer_profiles p ON u.id = p.user_id;

-- Ver perfil con todas sus skills
SELECT 
    p.id,
    p.job_title,
    STRING_AGG(s.skill, ', ') as skills
FROM programmer_profiles p
LEFT JOIN programmer_skills s ON p.id = s.profile_id
GROUP BY p.id, p.job_title;
```

---

## ✅ Resumen

### PostgreSQL
- Base de datos relacional con tablas, filas y columnas
- Soporta relaciones (OneToOne, OneToMany)
- Garantiza integridad de datos
- Creada y gestionada en Render

### Render
- Plataforma de hosting para backend y BD
- Auto-deploy desde GitHub
- Variables de entorno para seguridad
- URL pública: `https://backend-spring-wgjc.onrender.com`

### Endpoints
- URLs que realizan acciones específicas
- Definidos con `@GetMapping`, `@PostMapping`, etc.
- Reciben parámetros de URL, body, o headers
- Retornan respuestas JSON automáticamente

### Flujo Completo
```
Frontend → HTTP Request → Spring Security (JWT) → 
Controller → Service → Repository → PostgreSQL → 
Response JSON → Frontend
```

**¡Todo conectado y funcionando! 🚀**
