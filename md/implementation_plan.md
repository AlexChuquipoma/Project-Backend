# Implementation Plan: Programmer Profile System

Complete plan to implement a full-featured programmer profile management system.

---

## User Review Required

> [!IMPORTANT]
> **Breaking Changes:**
> - Will add new API endpoints that require authentication
> - Frontend `profile.astro` will change from localStorage to API calls
> - Requires database migration (add timestamps to `programmer_profiles` table)

> [!WARNING]
> **Security Considerations:**
> - Only users with role `PROGRAMMER` can create/edit profiles
> - Users can only edit their own profiles
> - Public profiles are readable without authentication

---

## Proposed Changes

### Backend Components

#### DTOs Package

##### [NEW] [ProgrammerProfileDTO.java](file:///c:/Users/Usuario/Desktop/U/Proyecto-Backend/project-backend/backend-spring/src/main/java/com/portfolio/backend/dto/ProgrammerProfileDTO.java)

Response DTO for profile data:
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
    private String imageUrl;
    private List<String> skills;
    private String githubUrl;
    private String linkedinUrl;
    private String instagramUrl;
    private String whatsappUrl;
    private Integer yearsExperience;
    private Double rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

##### [NEW] [UpdateProfileRequest.java](file:///c:/Users/Usuario/Desktop/U/Proyecto-Backend/project-backend/backend-spring/src/main/java/com/portfolio/backend/dto/UpdateProfileRequest.java)

Request DTO for updating profile:
```java
@Data
public class UpdateProfileRequest {
    private String jobTitle;
    private String bio;
    private String imageUrl;
    private List<String> skills;
    private String githubUrl;
    private String linkedinUrl;
    private String instagramUrl;
    private String whatsappUrl;
    private Integer yearsExperience;
}
```

---

#### Service Layer

##### [NEW] [ProgrammerProfileService.java](file:///c:/Users/Usuario/Desktop/U/Proyecto-Backend/project-backend/backend-spring/src/main/java/com/portfolio/backend/service/ProgrammerProfile Service.java)

Service interface:
```java
public interface ProgrammerProfileService {
    ProgrammerProfileDTO getProfileByUserId(Long userId);
    ProgrammerProfileDTO getMyProfile(String userEmail);
    ProgrammerProfileDTO createProfile(String userEmail, UpdateProfileRequest request);
    ProgrammerProfileDTO updateProfile(String userEmail, UpdateProfileRequest request);
    void deleteProfile(String userEmail);
}
```

##### [NEW] [ProgrammerProfileServiceImpl.java](file:///c:/Users/Usuario/Desktop/U/Proyecto-Backend/project-backend/backend-spring/src/main/java/com/portfolio/backend/service/ProgrammerProfileServiceImpl.java)

Implementation with:
- Authorization checks (user can only edit own profile)
- Auto-create profile if doesn't exist
- Convert entity to DTO
- Handle errors (user not found, profile not found, etc.)

---

#### Controller Layer

##### [NEW] [ProgrammerProfileController.java](file:///c:/Users/Usuario/Desktop/U/Proyecto-Backend/project-backend/backend-spring/src/main/java/com/portfolio/backend/controller/ProgrammerProfileController.java)

REST endpoints:
```java
@RestController
@RequestMapping("/api/profiles")
public class ProgrammerProfileController {
    
    // GET /api/profiles/me - Authenticated
    @GetMapping("/me")
    public ResponseEntity<ProgrammerProfileDTO> getMyProfile();
    
    // GET /api/profiles/user/{userId} - Public
    @GetMapping("/user/{userId}")
    public ResponseEntity<ProgrammerProfileDTO> getProfileByUserId(@PathVariable Long userId);
    
    // POST /api/profiles - Authenticated (PROGRAMMER only)
    @PostMapping
    public ResponseEntity<ProgrammerProfileDTO> createProfile(@RequestBody UpdateProfileRequest request);
    
    // PUT /api/profiles - Authenticated
    @PutMapping
    public ResponseEntity<ProgrammerProfileDTO> updateProfile(@RequestBody UpdateProfileRequest request);
    
    // DELETE /api/profiles - Authenticated
    @DeleteMapping
    public ResponseEntity<Void> deleteProfile();
}
```

---

#### Entity Update

##### [MODIFY] [ProgrammerProfile.java](file:///c:/Users/Usuario/Desktop/U/Proyecto-Backend/project-backend/backend-spring/src/main/java/com/portfolio/backend/entity/ProgrammerProfile.java)

Add timestamps:
```java
@Column(name = "created_at")
private LocalDateTime createdAt;

@Column(name = "updated_at")
private LocalDateTime updatedAt;

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

---

### Frontend Components

#### Services

##### [NEW] [profileService.ts](file:///c:/Users/Usuario/Desktop/U/Proyecto-Backend/project-backend/project-backend/src/lib/services/profileService.ts)

TypeScript service for API calls:
```typescript
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://backend-spring-wgjc.onrender.com';

export interface ProgrammerProfile {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    jobTitle?: string;
    bio?: string;
    imageUrl?: string;
    skills?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    whatsappUrl?: string;
    yearsExperience?: number;
    rating?: number;
}

export interface UpdateProfileData {
    jobTitle?: string;
    bio?: string;
    imageUrl?: string;
    skills?: string[];
    githubUrl?: string;
    linkedinUrl?: string;
    instagramUrl?: string;
    whatsappUrl?: string;
    yearsExperience?: number;
}

export async function getMyProfile(token: string): Promise<ProgrammerProfile>
export async function getProfileByUserId(userId: number): Promise<ProgrammerProfile>
export async function createProfile(data: UpdateProfileData, token: string): Promise<ProgrammerProfile>
export async function updateProfile(data: UpdateProfileData, token: string): Promise<ProgrammerProfile>
export async function deleteProfile(token: string): Promise<void>
```

---

#### Pages

##### [MODIFY] [profile.astro](file:///c:/Users/Usuario/Desktop/U/Proyecto-Backend/project-backend/project-backend/src/pages/programmer/profile.astro)

Changes:
1. Add fields for programmer profile data:
   - Job title
   - Biography (textarea)
   - Skills (dynamic list)
   - Social media links (GitHub, LinkedIn, Instagram, WhatsApp)
   - Years of experience

2. Replace localStorage logic with API calls:
   - Load profile from `GET /api/profiles/me`
   - Save using `PUT /api/profiles`

3. Handle cases where profile doesn't exist (create new)

4. Add proper error handling and loading states

---

## Verification Plan

### Automated Tests

#### Backend Testing (Bruno/Postman)

```javascript
// 1. Create Profile
POST https://backend-spring-wgjc.onrender.com/api/profiles
Authorization: Bearer {token}
{
  "jobTitle": "Full Stack Developer",
  "bio": "Passionate developer...",
  "skills": ["Java", "TypeScript", "PostgreSQL"],
  "githubUrl": "https://github.com/user",
  "linkedinUrl": "https://linkedin.com/in/user",
  "yearsExperience": 5
}

// 2. Get My Profile
GET https://backend-spring-wgjc.onrender.com/api/profiles/me
Authorization: Bearer {token}

// 3. Update Profile
PUT https://backend-spring-wgjc.onrender.com/api/profiles
Authorization: Bearer {token}
{
  "bio": "Updated bio...",
  "skills": ["Java", "TypeScript", "PostgreSQL", "Docker"]
}

// 4. Get Public Profile (no auth)
GET https://backend-spring-wgjc.onrender.com/api/profiles/user/1

// 5. Delete Profile
DELETE https://backend-spring-wgjc.onrender.com/api/profiles
Authorization: Bearer {token}
```

#### Frontend Testing

1. **Login as PROGRAMMER**
   - Navigate to `/programmer/profile`
   - Verify profile loads from API
   
2. **Create/Update Profile**
   - Fill all fields
   - Add multiple skills
   - Submit form
   - Verify data saved in database (DBeaver)

3. **View Profile**
   - Navigate to public profile view
   - Verify all data displayed correctly

---

### Manual Verification

#### Database Verification (DBeaver)

```sql
-- Check profile created
SELECT * FROM programmer_profiles WHERE user_id = 1;

-- Check skills saved
SELECT * FROM programmer_skills WHERE profile_id = 1;

-- Join with user data
SELECT 
    u.id,
    u.name,
    u.email,
    p.job_title,
    p.bio,
    p.github_url,
    p.years_experience
FROM users u
LEFT JOIN programmer_profiles p ON p.user_id = u.id
WHERE u.role = 'PROGRAMMER';
```

---

## Deployment Strategy

### 1. Backend Deployment

```bash
# Commit changes
git add .
git commit -m "feat: Add programmer profile management API"
git push origin main

# Render will auto-deploy
# Monitor logs for errors
```

### 2. Frontend Deployment

```bash
# Build production bundle
cd project-backend
npm run build

# Deploy to Firebase
firebase deploy

# Verify deployment
curl https://backend-portfolio-f9095.web.app/programmer/profile
```

### 3. Production Testing

1. Login to production app
2. Create/update profile
3. Verify data in production database (Render PostgreSQL)
4. Test public profile view

---

## Rollback Plan

If issues occur:

**Backend:**
```bash
# Revert commit
git revert HEAD
git push origin main
```

**Frontend:**
```bash
# Firebase rollback to previous version
firebase hosting:rollback
```

---

## Next Steps After Completion

1. ✅ Profile system working
2. Implement project management (CRUD for programmer projects)
3. Add advisory/consultation scheduling system
4. Implement ratings and reviews
5. Add image upload (Cloudinary integration)
