# 🚀 Guía Completa: Integración Spring Boot + Astro

## 📋 Índice
1. [Visión General del Sistema](#visión-general-del-sistema)
2. [Arquitectura Completa](#arquitectura-completa)
3. [Backend: Spring Boot](#backend-spring-boot)
4. [Frontend: Astro](#frontend-astro)
5. [Integración y Comunicación](#integración-y-comunicación)
6. [Flujo Completo de Datos](#flujo-completo-de-datos)
7. [Seguridad y Autenticación](#seguridad-y-autenticación)
8. [Deployment](#deployment)

---

## 🎯 Visión General del Sistema

### ¿Qué Construimos?

Un sistema completo de **gestión de perfiles de programadores** que permite:
- ✅ Registro y autenticación de usuarios
- ✅ Creación y edición de perfiles profesionales
- ✅ Gestión de habilidades (skills)
- ✅ Enlaces a redes sociales
- ✅ Visualización pública de perfiles

### Stack Tecnológico

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                      │
│  Astro + TypeScript + Vanilla CSS               │
│  Deployed on: Firebase Hosting                  │
│  URL: https://project-backend-d8f0c.web.app     │
└────────────────┬────────────────────────────────┘
                 │
                 │ HTTP/JSON + JWT
                 │
┌────────────────▼────────────────────────────────┐
│                   BACKEND                       │
│  Spring Boot 3.x + Java 17                      │
│  Deployed on: Render                            │
│  URL: https://backend-spring-wgjc.onrender.com  │
└────────────────┬────────────────────────────────┘
                 │
                 │ JPA/Hibernate
                 │
┌────────────────▼────────────────────────────────┐
│                  DATABASE                       │
│  PostgreSQL 16                                  │
│  Hosted on: Render                              │
└─────────────────────────────────────────────────┘
```

---

## 🏗️ Arquitectura Completa

### Capas del Sistema

| Capa | Tecnología | Responsabilidad |
|------|-----------|-----------------|
| **Presentación** | Astro (HTML/CSS/TS) | UI/UX, formularios, validación cliente |
| **API REST** | Spring Boot Controllers | Endpoints HTTP, validación requests |
| **Lógica de Negocio** | Spring Services | Reglas de negocio, validaciones |
| **Acceso a Datos** | Spring Data JPA | CRUD, queries a BD |
| **Persistencia** | PostgreSQL | Almacenamiento de datos |
| **Seguridad** | Spring Security + JWT | Autenticación y autorización |

---

## 🔧 Backend: Spring Boot

### Estructura del Proyecto

```
backend-spring/
├── src/main/java/com/portfolio/backend/
│   ├── config/
│   │   └── SecurityConfig.java
│   ├── controller/
│   │   └── ProgrammerProfileController.java
│   ├── dto/
│   │   ├── ProgrammerProfileDTO.java
│   │   └── UpdateProfileRequest.java
│   ├── entity/
│   │   ├── User.java
│   │   └── ProgrammerProfile.java
│   ├── repository/
│   │   ├── UserRepository.java
│   │   └── ProgrammerProfileRepository.java
│   ├── service/
│   │   ├── ProgrammerProfileService.java
│   │   └── ProgrammerProfileServiceImpl.java
│   ├── security/
│   │   ├── JwtUtil.java
│   │   └── JwtAuthenticationFilter.java
│   └── PortfolioBackendApplication.java
└── pom.xml
```

### 1. Entidades (Modelo de Datos)

#### User.java
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    @Column(unique = true, nullable = false)
    private String email;
    
    private String password;
    
    @Enumerated(EnumType.STRING)
    private Role role;  // USER o PROGRAMMER
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

#### ProgrammerProfile.java
```java
@Entity
@Table(name = "programmer_profiles")
public class ProgrammerProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    private String jobTitle;
    
    @Column(columnDefinition = "TEXT")
    private String bio;
    
    @ElementCollection
    @CollectionTable(name = "programmer_skills")
    @Column(name = "skill")
    private List<String> skills;
    
    private String githubUrl;
    private String linkedinUrl;
    private Integer yearsExperience;
    private Double rating;
}
```

### 2. DTOs

#### ¿Por qué usar DTOs?

- 🔒 **Seguridad:** No exponemos datos sensibles
- 🎯 **Control:** Decidimos qué datos enviar
- 🔄 **Desacoplamiento:** Cambiar entidad sin romper API

#### ProgrammerProfileDTO.java
```java
@Data
@Builder
public class ProgrammerProfileDTO {
    private Long id;
    private Long userId;
    private String userName;
    private String userEmail;
    private String jobTitle;
    private String bio;
    private List<String> skills;
    private String githubUrl;
    private Integer yearsExperience;
    private Double rating;
}
```

### 3. Service (Lógica de Negocio)

```java
@Service
@RequiredArgsConstructor
public class ProgrammerProfileServiceImpl {
    
    private final ProgrammerProfileRepository profileRepository;
    private final UserRepository userRepository;
    
    @Transactional
    public ProgrammerProfileDTO createOrUpdateProfile(
            String userEmail, UpdateProfileRequest request) {
        
        // 1. Buscar usuario
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // 2. Validar rol PROGRAMMER
        if (user.getRole() != Role.PROGRAMMER) {
            throw new RuntimeException("Only PROGRAMMER can create profiles");
        }
        
        // 3. Buscar o crear perfil
        ProgrammerProfile profile = profileRepository.findByUser(user)
                .orElse(ProgrammerProfile.builder()
                        .user(user)
                        .rating(0.0)
                        .build());
        
        // 4. Actualizar campos
        profile.setJobTitle(request.getJobTitle());
        profile.setBio(request.getBio());
        profile.setSkills(request.getSkills());
        
        // 5. Guardar
        ProgrammerProfile saved = profileRepository.save(profile);
        
        // 6. Convertir a DTO
        return convertToDTO(saved);
    }
}
```

### 4. Controller (REST API)

```java
@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "*")
public class ProgrammerProfileController {
    
    private final ProgrammerProfileService profileService;
    
    @GetMapping("/me")
    public ResponseEntity<ProgrammerProfileDTO> getMyProfile(
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(profileService.getMyProfile(userEmail));
    }
    
    @PostMapping
    public ResponseEntity<ProgrammerProfileDTO> createOrUpdateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(
            profileService.createOrUpdateProfile(userEmail, request));
    }
}
```

### 5. Seguridad (JWT)

#### SecurityConfig.java
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfig()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/profiles/user/**").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

#### JwtAuthenticationFilter.java
```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) {
        
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwt = authHeader.substring(7);
            String userEmail = jwtUtil.extractUsername(jwt);
            
            if (jwtUtil.isTokenValid(jwt, userDetails)) {
                SecurityContextHolder.getContext()
                    .setAuthentication(authToken);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

---

## 🎨 Frontend: Astro

### Estructura del Proyecto

```
project-backend/
├── src/
│   ├── pages/
│   │   └── programmer/
│   │       └── profile.astro
│   ├── lib/
│   │   ├── services/
│   │   │   └── profileService.ts
│   │   └── utils/
│   │       └── localStorage.ts
│   └── layouts/
│       └── Layout.astro
└── firebase.json
```

### 1. Servicio de API (profileService.ts)

```typescript
const API_BASE_URL = 'https://backend-spring-wgjc.onrender.com';

export interface ProgrammerProfile {
    id: number;
    userId: number;
    userName: string;
    jobTitle?: string;
    bio?: string;
    skills?: string[];
    githubUrl?: string;
}

export async function getMyProfile(): Promise<ProgrammerProfile> {
    const user = getUser();
    
    const response = await fetch(`${API_BASE_URL}/api/profiles/me`, {
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch profile');
    }

    return response.json();
}

export async function createOrUpdateProfile(
        data: UpdateProfileData): Promise<ProgrammerProfile> {
    const user = getUser();
    
    const response = await fetch(`${API_BASE_URL}/api/profiles`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    return response.json();
}
```

### 2. Página de Perfil (profile.astro)

```astro
<script>
    import { getMyProfile, createOrUpdateProfile } from '../../lib/services/profileService';

    let skills: string[] = [];

    async function loadProfile() {
        try {
            const profile = await getMyProfile();
            
            // Llenar formulario
            document.getElementById('jobTitle').value = profile.jobTitle || '';
            document.getElementById('bio').value = profile.bio || '';
            skills = profile.skills || [];
            renderSkills();
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    async function saveProfile(event: Event) {
        event.preventDefault();

        const data = {
            jobTitle: document.getElementById('jobTitle').value,
            bio: document.getElementById('bio').value,
            skills: skills,
        };

        await createOrUpdateProfile(data);
        alert('✅ Perfil guardado');
    }

    document.addEventListener('DOMContentLoaded', loadProfile);
</script>
```

---

## 🔄 Integración y Comunicación

### Flujo de Autenticación

```
Frontend                                Backend
   │                                       │
   │ 1. POST /api/auth/login              │
   │    { email, password }               │
   ├──────────────────────────────────────>│
   │                                       │
   │                     2. Validar user   │
   │                     3. Generar JWT    │
   │                                       │
   │ 4. { token, user }                   │
   │<──────────────────────────────────────┤
   │                                       │
   │ 5. Guardar en localStorage            │
   │                                       │
   │ 6. GET /api/profiles/me              │
   │    Authorization: Bearer {token}     │
   ├──────────────────────────────────────>│
   │                                       │
   │                     7. Validar JWT    │
   │                     8. Buscar perfil  │
   │                                       │
   │ 9. { profile data }                  │
   │<──────────────────────────────────────┤
```

### Manejo de CORS

**Backend (Spring Boot):**
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(Arrays.asList("*"));
    config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE"));
    config.setAllowedHeaders(Arrays.asList("*"));
    return source;
}
```

---

## 📡 Flujo Completo de Datos

### Ejemplo: Guardar Perfil

**1. Frontend captura datos:**
```typescript
const data = {
    jobTitle: "Full Stack Developer",
    bio: "Passionate developer...",
    skills: ["Java", "Spring Boot", "React"]
};
```

**2. Petición HTTP:**
```typescript
fetch('https://backend-spring-wgjc.onrender.com/api/profiles', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer eyJhbGc...',
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
});
```

**3. Spring Security valida JWT:**
```java
String jwt = authHeader.substring(7);
String userEmail = jwtUtil.extractUsername(jwt);
```

**4. Controller recibe:**
```java
@PostMapping
public ResponseEntity<ProgrammerProfileDTO> createOrUpdateProfile(
        @RequestBody UpdateProfileRequest request,
        Authentication authentication) {
    String userEmail = authentication.getName();
    return ResponseEntity.ok(profileService.createOrUpdateProfile(userEmail, request));
}
```

**5. Service procesa:**
```java
User user = userRepository.findByEmail(userEmail);
ProgrammerProfile profile = profileRepository.findByUser(user)
        .orElse(new ProgrammerProfile());
profile.setJobTitle(request.getJobTitle());
profileRepository.save(profile);
```

**6. PostgreSQL guarda:**
```sql
INSERT INTO programmer_profiles (user_id, job_title, bio) 
VALUES (2, 'Full Stack Developer', 'Passionate developer...');
```

**7. Response JSON:**
```json
{
  "id": 1,
  "userId": 2,
  "userName": "Alexander",
  "jobTitle": "Full Stack Developer",
  "skills": ["Java", "Spring Boot", "React"]
}
```

---

## 🔐 Seguridad y Autenticación

### JWT (JSON Web Token)

**Estructura:**
```
eyJhbGc....[Header].[Payload].[Signature]
```

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": "alexutfsx@gmail.com",
  "iat": 1707348000,
  "exp": 1707434400
}
```

### Niveles de Seguridad

| Endpoint | Acceso | Validación |
|----------|--------|-----------|
| `POST /api/auth/login` | Público | Credenciales |
| `GET /api/profiles/user/{id}` | Público | Ninguna |
| `GET /api/profiles/me` | Privado | JWT válido |
| `POST /api/profiles` | Privado | JWT + PROGRAMMER |

---

## 🚀 Deployment

### Backend (Render)

**Variables de entorno:**
```
DATABASE_URL=jdbc:postgresql://...
JWT_SECRET=your-secret-key
```

**URL:** `https://backend-spring-wgjc.onrender.com`

### Frontend (Firebase)

**Build:**
```bash
npm run build
firebase deploy
```

**URL:** `https://project-backend-d8f0c.web.app`

---

## ✅ Resumen

### Tecnologías Usadas
- **Backend:** Spring Boot + PostgreSQL + JWT
- **Frontend:** Astro + TypeScript
- **Comunicación:** REST API + JSON
- **Seguridad:** Spring Security + JWT
- **Deployment:** Render + Firebase

### Conceptos Clave
1. Arquitectura REST separada
2. DTOs para seguridad
3. JPA para persistencia
4. JWT para autenticación
5. CORS para cross-origin
6. Transacciones con `@Transactional`

**¡Sistema completo funcionando! 🎉**
