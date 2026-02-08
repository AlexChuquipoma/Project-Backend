# 📚 Documentación del Sistema de Perfiles de Programadores

## 🎯 Resumen General

Este sistema permite que los programadores creen y gestionen sus perfiles profesionales, incluyendo:
- Información profesional (título, años de experiencia, biografía)
- Habilidades técnicas (lista de skills)
- Enlaces a redes sociales (GitHub, LinkedIn, Instagram, WhatsApp)
- Calificación promedio (rating)

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────┐
│   Frontend  │  (Astro + TypeScript)
│  Firebase   │
└──────┬──────┘
       │ HTTP/JSON
       │ JWT Token
       ▼
┌─────────────────────────────────────┐
│         Spring Boot Backend         │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  ProgrammerProfileController │  │  ← Capa REST (Endpoints)
│  └────────────┬─────────────────┘  │
│               │                     │
│  ┌────────────▼─────────────────┐  │
│  │ ProgrammerProfileServiceImpl │  │  ← Lógica de Negocio
│  └────────────┬─────────────────┘  │
│               │                     │
│  ┌────────────▼─────────────────┐  │
│  │ProgrammerProfileRepository   │  │  ← Acceso a Datos (JPA)
│  └────────────┬─────────────────┘  │
│               │                     │
└───────────────┼─────────────────────┘
                │
                ▼
        ┌──────────────┐
        │  PostgreSQL  │
        │   Database   │
        └──────────────┘
```

---

## 📊 Modelo de Datos

### Tabla: `users`
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,  -- 'USER' o 'PROGRAMMER'
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Tabla: `programmer_profiles`
```sql
CREATE TABLE programmer_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,  -- FK a users (OneToOne)
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Tabla: `programmer_skills`
```sql
CREATE TABLE programmer_skills (
    profile_id BIGINT NOT NULL,  -- FK a programmer_profiles
    skill VARCHAR(255),
    FOREIGN KEY (profile_id) REFERENCES programmer_profiles(id) ON DELETE CASCADE
);
```

**Relaciones:**
- `User` ↔ `ProgrammerProfile`: **OneToOne** (Un usuario tiene un solo perfil)
- `ProgrammerProfile` ↔ `Skills`: **OneToMany** (Un perfil tiene muchas habilidades)

---

## 🔑 Conceptos Clave

### 1. **Entidad vs DTO**

**Entidad (`ProgrammerProfile.java`):**
- Representa una tabla en la base de datos
- Contiene anotaciones JPA (`@Entity`, `@Table`, `@Column`)
- Tiene relaciones con otras entidades (`@OneToOne`, `@ElementCollection`)
- **NO se expone directamente al frontend**

**DTO (`ProgrammerProfileDTO.java`):**
- Data Transfer Object - Objeto para transferir datos
- Solo contiene los campos que queremos exponer en la API
- **SÍ se envía al frontend como JSON**
- Desacopla la estructura interna de la API pública

**¿Por qué usar DTOs?**
- **Seguridad:** No exponemos relaciones internas ni datos sensibles
- **Control:** Decidimos exactamente qué datos enviar
- **Flexibilidad:** Podemos cambiar la entidad sin romper la API

---

### 2. **Anotaciones JPA Importantes**

#### `@Entity`
Marca una clase como entidad de base de datos.

#### `@Table(name = "programmer_profiles")`
Especifica el nombre de la tabla en la BD.

#### `@Id` + `@GeneratedValue`
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```
- `@Id`: Marca el campo como clave primaria
- `@GeneratedValue`: La BD genera el valor automáticamente (AUTO_INCREMENT)

#### `@OneToOne`
```java
@OneToOne
@JoinColumn(name = "user_id", nullable = false, unique = true)
private User user;
```
- Relación uno a uno con `User`
- `unique = true`: Garantiza que no haya duplicados
- `nullable = false`: El campo es obligatorio

#### `@ElementCollection`
```java
@ElementCollection
@CollectionTable(name = "programmer_skills", joinColumns = @JoinColumn(name = "profile_id"))
@Column(name = "skill")
private List<String> skills;
```
- Para colecciones de tipos simples (String, Integer, etc.)
- Crea una tabla separada automáticamente
- **NO** es una relación con otra entidad

#### `@PrePersist` y `@PreUpdate`
```java
@PrePersist
protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
}

@PreUpdate
protected void onUpdate() {
    updatedAt = LocalDateTime.now();
}
```
- `@PrePersist`: Se ejecuta ANTES de INSERT
- `@PreUpdate`: Se ejecuta ANTES de UPDATE
- Útil para timestamps automáticos

---

### 3. **Inyección de Dependencias**

```java
@RequiredArgsConstructor
public class ProgrammerProfileServiceImpl {
    private final ProgrammerProfileRepository profileRepository;
    private final UserRepository userRepository;
}
```

**¿Qué hace `@RequiredArgsConstructor`?**
- Lombok genera automáticamente un constructor con todos los campos `final`
- Spring usa ese constructor para inyectar las dependencias
- Equivalente a:
```java
public ProgrammerProfileServiceImpl(
    ProgrammerProfileRepository profileRepository,
    UserRepository userRepository) {
    this.profileRepository = profileRepository;
    this.userRepository = userRepository;
}
```

---

### 4. **Transacciones con `@Transactional`**

```java
@Transactional
public ProgrammerProfileDTO createOrUpdateProfile(...) {
    // Múltiples operaciones en la BD
}
```

**¿Qué hace?**
- Agrupa múltiples operaciones en una sola transacción
- Si algo falla, hace **rollback** automático (deshace todo)
- Si todo sale bien, hace **commit** (guarda todo)

**Ejemplo:**
```java
@Transactional
public void transferMoney(Account from, Account to, double amount) {
    from.withdraw(amount);  // Operación 1
    to.deposit(amount);     // Operación 2
    // Si falla la operación 2, la operación 1 también se deshace
}
```

---

### 5. **Spring Security y Authentication**

```java
@GetMapping("/me")
public ResponseEntity<ProgrammerProfileDTO> getMyProfile(Authentication authentication) {
    String userEmail = authentication.getName();
    // ...
}
```

**¿Cómo funciona?**
1. El frontend envía el token JWT en el header:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. Spring Security intercepta la petición

3. Valida el token JWT

4. Si es válido, extrae el email del usuario

5. Crea un objeto `Authentication` con esa información

6. Lo inyecta automáticamente en el método del controller

**Configuración en `SecurityConfig.java`:**
```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()           // Público
    .requestMatchers("/api/profiles/user/**").permitAll()  // Público
    .anyRequest().authenticated()                          // Requiere auth
)
```

---

## 🔐 Modelo de Seguridad

### Endpoints Públicos (Sin autenticación)
- `POST /api/auth/register` - Registro de usuarios
- `POST /api/auth/login` - Login
- `GET /api/profiles/user/{userId}` - Ver perfil público

### Endpoints Protegidos (Requieren JWT)
- `GET /api/profiles/me` - Ver mi perfil
- `POST /api/profiles` - Crear/actualizar perfil
- `PUT /api/profiles` - Actualizar perfil
- `DELETE /api/profiles` - Eliminar perfil

### Validaciones de Negocio
1. **Solo PROGRAMMER puede crear perfiles:**
   ```java
   if (user.getRole() != Role.PROGRAMMER) {
       throw new RuntimeException("Only users with PROGRAMMER role can create profiles");
   }
   ```

2. **Solo el dueño puede editar su perfil:**
   - El email viene del token JWT
   - No se puede editar el perfil de otro usuario

---

## 📡 Flujo de una Petición

### Ejemplo: Crear un perfil

**1. Frontend hace la petición:**
```typescript
const response = await fetch('https://backend-spring-wgjc.onrender.com/api/profiles', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        jobTitle: 'Full Stack Developer',
        bio: 'Passionate developer...',
        skills: ['Java', 'Spring Boot', 'React']
    })
});
```

**2. Spring Security valida el token:**
- Si es inválido → 401 Unauthorized
- Si es válido → Continúa

**3. Controller recibe la petición:**
```java
@PostMapping
public ResponseEntity<ProgrammerProfileDTO> createOrUpdateProfile(
    @RequestBody UpdateProfileRequest request,  // ← JSON deserializado automáticamente
    Authentication authentication) {            // ← Email del usuario desde JWT
```

**4. Service ejecuta la lógica:**
```java
public ProgrammerProfileDTO createOrUpdateProfile(String userEmail, UpdateProfileRequest request) {
    // 1. Buscar usuario
    // 2. Validar rol PROGRAMMER
    // 3. Buscar o crear perfil
    // 4. Actualizar campos
    // 5. Guardar en BD
    // 6. Convertir a DTO
    // 7. Retornar
}
```

**5. Repository guarda en PostgreSQL:**
```java
ProgrammerProfile savedProfile = profileRepository.save(profile);
// JPA genera automáticamente: INSERT INTO programmer_profiles (...)
```

**6. Controller retorna la respuesta:**
```java
return ResponseEntity.ok(profile);
// HTTP 200 OK con JSON del perfil
```

**7. Frontend recibe el JSON:**
```json
{
  "id": 1,
  "userId": 2,
  "userName": "Alexander Chuquipoma",
  "jobTitle": "Full Stack Developer",
  "skills": ["Java", "Spring Boot", "React"],
  ...
}
```

---

## 🧪 Cómo Probar

### 1. Obtener Token JWT
```bash
POST http://localhost:8080/api/auth/login
{
  "email": "alexutfsx@gmail.com",
  "password": "tu-password"
}
```

### 2. Crear Perfil
```bash
POST http://localhost:8080/api/profiles
Authorization: Bearer {token}
{
  "jobTitle": "Full Stack Developer",
  "bio": "Passionate developer...",
  "skills": ["Java", "Spring Boot", "PostgreSQL"],
  "githubUrl": "https://github.com/usuario",
  "yearsExperience": 5
}
```

### 3. Ver Mi Perfil
```bash
GET http://localhost:8080/api/profiles/me
Authorization: Bearer {token}
```

### 4. Ver Perfil Público (sin auth)
```bash
GET http://localhost:8080/api/profiles/user/2
```

---

## 📝 Puntos Clave para Recordar

1. **Entidades NO se exponen directamente** → Siempre usar DTOs
2. **`@Transactional` para operaciones múltiples** → Garantiza atomicidad
3. **`@ElementCollection` para listas simples** → No es una relación
4. **`Authentication` contiene el email del usuario** → Viene del JWT
5. **Repository extiende JpaRepository** → Métodos CRUD automáticos
6. **`@PrePersist` y `@PreUpdate`** → Timestamps automáticos
7. **Validar rol PROGRAMMER** → Solo ellos pueden crear perfiles
8. **CORS configurado** → Frontend puede hacer peticiones

---

## 🚀 Próximos Pasos

- [ ] Agregar validaciones con `@Valid` y `@NotNull`
- [ ] Manejo de excepciones personalizado (`@ControllerAdvice`)
- [ ] Paginación para listar perfiles
- [ ] Búsqueda y filtros (por skills, años de experiencia)
- [ ] Subida de imágenes (Cloudinary)
- [ ] Sistema de reviews y ratings
