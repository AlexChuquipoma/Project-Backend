# 🧪 Testing Programmer Profile API

## 📋 Prerequisites

- Backend running (local or Render)
- Valid JWT token from login
- User with PROGRAMMER role

---

## 🔑 Get JWT Token First

```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "email": "alexutfsx@gmail.com",
  "password": "your-password"
}
```

Copy the `token` from the response.

---

## 📝 API Endpoints

### 1. Create/Update My Profile

**Request:**
```http
POST http://localhost:8080/api/profiles
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "jobTitle": "Full Stack Developer",
  "bio": "Passionate developer with 5+ years of experience in building scalable web applications. Specialized in Java Spring Boot and modern frontend frameworks.",
  "imageUrl": "https://ui-avatars.com/api/?name=Alex",
  "skills": ["Java", "Spring Boot", "PostgreSQL", "TypeScript", "React", "Docker"],
  "githubUrl": "https://github.com/alexchuquipoma",
  "linkedinUrl": "https://linkedin.com/in/alexchuquipoma",
  "instagramUrl": "https://instagram.com/alexchuquipoma",
  "whatsappUrl": "https://wa.me/123456789",
  "yearsExperience": 5
}
```

**Expected Response:**
```json
{
  "id": 1,
  "userId": 2,
  "userName": "Alexander Chuquipoma",
  "userEmail": "alexutfsx@gmail.com",
  "jobTitle": "Full Stack Developer",
  "bio": "Passionate developer with 5+ years...",
  "imageUrl": "https://ui-avatars.com/api/?name=Alex",
  "skills": ["Java", "Spring Boot", "PostgreSQL", "TypeScript", "React", "Docker"],
  "githubUrl": "https://github.com/alexchuquipoma",
  "linkedinUrl": "https://linkedin.com/in/alexchuquipoma",
  "instagramUrl": "https://instagram.com/alexchuquipoma",
  "whatsappUrl": "https://wa.me/123456789",
  "yearsExperience": 5,
  "rating": 0.0,
  "createdAt": "2026-02-07T23:15:00",
  "updatedAt": "2026-02-07T23:15:00"
}
```

---

### 2. Get My Profile

**Request:**
```http
GET http://localhost:8080/api/profiles/me
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```json
{
  "id": 1,
  "userId": 2,
  "userName": "Alexander Chuquipoma",
  "userEmail": "alexutfsx@gmail.com",
  "jobTitle": "Full Stack Developer",
  ...
}
```

---

### 3. Update My Profile

**Request:**
```http
PUT http://localhost:8080/api/profiles
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "jobTitle": "Senior Full Stack Developer",
  "bio": "Updated bio with more experience...",
  "skills": ["Java", "Spring Boot", "PostgreSQL", "TypeScript", "React", "Docker", "Kubernetes"],
  "yearsExperience": 6
}
```

Note: Only include fields you want to update. Missing fields will be set to null/empty.

---

### 4. Get Public Profile (No Auth Required)

**Request:**
```http
GET http://localhost:8080/api/profiles/user/2
```

Replace `2` with the actual user ID.

**Expected Response:**
```json
{
  "id": 1,
  "userId": 2,
  "userName": "Alexander Chuquipoma",
  "userEmail": "alexutfsx@gmail.com",
  "jobTitle": "Senior Full Stack Developer",
  ...
}
```

---

### 5. Delete My Profile

**Request:**
```http
DELETE http://localhost:8080/api/profiles
Authorization: Bearer YOUR_TOKEN_HERE
```

**Expected Response:**
```
Status: 204 No Content
```

---

## 🌐 Production URLs

Replace `http://localhost:8080` with `https://backend-spring-wgjc.onrender.com` for production testing.

---

## ✅ Verification Checklist

- [ ] Create profile successfully
- [ ] Get own profile with `/me` endpoint
- [ ] Update profile and verify changes
- [ ] View public profile without authentication
- [ ] Verify only PROGRAMMER role can create profiles
- [ ] Verify user cannot edit other users' profiles
- [ ] Delete profile successfully
- [ ] Check database with DBeaver to confirm persistence

---

## 🐛 Common Errors

### Error: "Profile not found"
**Solution:** Create a profile first using POST endpoint

### Error: "Only users with PROGRAMMER role can create profiles"
**Solution:** Update your user role to PROGRAMMER in database:
```sql
UPDATE users SET role = 'PROGRAMMER' WHERE email = 'your-email@example.com';
```

### Error: "401 Unauthorized"
**Solution:** Make sure you're including the `Authorization: Bearer TOKEN` header

### Error: "User not found"
**Solution:** Verify the token is valid and user exists

---

## 📊 Database Verification

After creating/updating profile, verify in DBeaver:

```sql
-- View all profiles
SELECT * FROM programmer_profiles;

-- View with user info
SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    p.job_title,
    p.bio,
    p.years_experience,
    p.rating,
    p.created_at,
    p.updated_at
FROM users u
LEFT JOIN programmer_profiles p ON p.user_id = u.id
WHERE u.role = 'PROGRAMMER';

-- View skills
SELECT * FROM programmer_skills;
```
