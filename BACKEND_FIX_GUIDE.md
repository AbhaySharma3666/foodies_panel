# 🔧 Backend Fix: Cart 403 Forbidden Error

## Problem
The frontend is receiving **403 Forbidden** errors when accessing `/api/cart` endpoints, even though the backend's `SecurityConfig` permits them publicly.

```
GET http://localhost:8080/api/cart 403 (Forbidden)
POST http://localhost:8080/api/cart 403 (Forbidden)
DELETE http://localhost:8080/api/cart 403 (Forbidden)
```

## Root Cause
There's a **mismatch between `SecurityConfig.java` and `JwtAuthenticationFilter.java`**:

- **SecurityConfig** (`permitsAll`): Says `/api/cart` is public
- **JwtAuthenticationFilter** (not in skip list): Still tries to validate JWT
- When JWT validation fails → Spring returns **403**

## ✅ Solution: Update JwtAuthenticationFilter.java

### File Location
```
foodiesapi/src/main/java/com/abhayproj/filters/JwtAuthenticationFilter.java
```

### Change Required

**Find this code (around line 31-37):**
```java
String requestURI = request.getRequestURI();
if (requestURI.contains("/api/register") ||
        requestURI.contains("/api/login") ||
        requestURI.contains("/api/foods") ||
        requestURI.contains("/api/orders/all") ||
        requestURI.contains("/api/orders/status")) {
    filterChain.doFilter(request, response);
    return;
}
```

**Replace with:**
```java
String requestURI = request.getRequestURI();
if (requestURI.contains("/api/register") ||
        requestURI.contains("/api/login") ||
        requestURI.contains("/api/foods") ||
        requestURI.contains("/api/orders/all") ||
        requestURI.contains("/api/orders/status") ||
        requestURI.contains("/api/cart")) {  // ← ADD THIS LINE
    filterChain.doFilter(request, response);
    return;
}
```

### Why This Works
- Skips JWT validation for `/api/cart` endpoints
- Let it proceed to `SecurityConfig` which already permits them
- No more 403 errors on cart operations

---

## 🔄 Full Updated JwtAuthenticationFilter.java

```java
package com.abhayproj.filters;

import com.abhayproj.service.UserService;
import com.abhayproj.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String requestURI = request.getRequestURI();
        
        // Skip JWT validation for public endpoints
        if (requestURI.contains("/api/register") ||
                requestURI.contains("/api/login") ||
                requestURI.contains("/api/foods") ||
                requestURI.contains("/api/orders/all") ||
                requestURI.contains("/api/orders/status") ||
                requestURI.contains("/api/cart")) {  // ← FIXED: Added cart endpoints
            filterChain.doFilter(request, response);
            return;
        }

        // Validate JWT for protected endpoints
        final String authHeader = request.getHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                String email = jwtUtil.extractUsername(token);

                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = this.userDetailsService.loadUserByUsername(email);
                    if (jwtUtil.validateToken(token, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails,
                                null,
                                userDetails.getAuthorities()
                        );
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        } else {
            System.out.println("No Bearer token found in request to: " + request.getRequestURI());
        }

        filterChain.doFilter(request, response);
    }
}
```

---

## 📋 Steps to Apply Fix

1. **Open the file:**
   ```
   foodiesapi/src/main/java/com/abhayproj/filters/JwtAuthenticationFilter.java
   ```

2. **Add `/api/cart` to skip list** (line 37)
   ```java
   requestURI.contains("/api/cart")  // ← Add this
   ```

3. **Save the file**

4. **Rebuild the backend:**
   ```bash
   mvn clean compile
   # or if using Maven wrapper
   ./mvnw clean compile
   ```

5. **Restart the backend server:**
   - Stop: `Ctrl+C`
   - Start: `./mvnw spring-boot:run`

---

## 🧪 Verify the Fix

### Option 1: Using cURL
```bash
# Test cart endpoint (should return data, not 403)
curl -H "Authorization: Bearer your_jwt_token" \
     http://localhost:8080/api/cart
```

### Option 2: Browser Console
After restarting backend, refresh the frontend and check console:
- Should see cart data loading without errors
- No more "403 Forbidden" errors

### Option 3: React Application
- Page should load without cart errors
- Cart operations should work
- No "Failed to clear cart" messages

---

## 🎯 Expected Behavior After Fix

| Endpoint | Before | After |
|----------|--------|-------|
| GET /api/cart | ❌ 403 | ✅ 200 |
| POST /api/cart | ❌ 403 | ✅ 201 |
| DELETE /api/cart | ❌ 403 | ✅ 200 |
| GET /api/foods | ✅ 200 | ✅ 200 |
| POST /api/register | ✅ 201 | ✅ 201 |

---

## 🆘 Still Getting 403 After Fix?

### Checklist
- [ ] Did you save the file?
- [ ] Did you rebuild the project?
- [ ] Did you restart the server?
- [ ] Is the server running on port 8080?
- [ ] Check backend console for any errors
- [ ] Hard refresh browser (Ctrl+Shift+R)

### Debug Command
```bash
# Check if endpoint is accessible
curl -v http://localhost:8080/api/cart
# Should see 200 or 403, not connection refused
```

---

## 📝 Additional Notes

This fix makes `/api/cart` truly public as intended by `SecurityConfig`.

If you want to make cart operations **require authentication**, then:
1. Remove `/api/cart/**` from `SecurityConfig.permitAll()`
2. Add it only to `JwtAuthenticationFilter` skip list (current state)
3. This way it validates JWT properly

---

**After applying this fix, refresh your frontend at `http://localhost:5173` and the cart errors should be resolved!**
