//package com.example.hms.config;
//
//import java.nio.charset.StandardCharsets;
//import java.util.Date;
//
//import javax.crypto.SecretKey;
//
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.stereotype.Component;
//
//import io.jsonwebtoken.Claims;
//import io.jsonwebtoken.Jwts;
//import io.jsonwebtoken.SignatureAlgorithm;
//import io.jsonwebtoken.security.Keys;
//
//@Component
//public class JwtConfig {
//
//    // Use at least 32 characters for HS256 key
//    private final String secret = "mySuperSecretKey123!@#mySuperSecretKey123!@#";
//    private final long expiration = 86400000; // 1 day
//
//    private SecretKey getSigningKey() {
//        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
//    }
//
//    public String generateToken(String email) {
//        return Jwts.builder()
//                .setSubject(email)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + expiration))
//                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
//                .compact();
//    }
//
////    public String extractEmail(String token) {
////        return getClaims(token).getSubject();
////    }
////
////    public boolean isTokenExpired(String token) {
////        return getClaims(token).getExpiration().before(new Date());
////    }
//    public String extractUsername(String token) { return extractEmail(token); }
//    public boolean validateToken(String token, UserDetails userDetails) { return extractUsername(token).equals(userDetails.getUsername()) && !isTokenExpired(token); }
//
//
//    private Claims getClaims(String token) {
//        return Jwts.parserBuilder()
//                .setSigningKey(getSigningKey())
//                .build()
//                .parseClaimsJws(token)
//                .getBody();
//    }
//}

package com.example.hms.config;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

//@Component
//public class JwtConfig {
//
//    private final String secret = "mySuperSecretKey123!@#mySuperSecretKey123!@#"; // >= 32 chars
//    private final long expiration = 86400000; // 1 day
//
//    private SecretKey getSigningKey() {
//        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
//    }
//
//    // Generate token with role claim
//    public String generateToken(String email, String role) {
//        return Jwts.builder()
//                .setSubject(email)
//                .claim("role", role)
//                .setIssuedAt(new Date())
//                .setExpiration(new Date(System.currentTimeMillis() + expiration))
//                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
//                .compact();
//    }
//
//    public Claims getClaims(String token) {
//        return Jwts.parserBuilder()
//                .setSigningKey(getSigningKey())
//                .build()
//                .parseClaimsJws(token)
//                .getBody();
//    }
//
//    public String extractEmail(String token) {
//        return getClaims(token).getSubject();
//    }
//
//    public String extractRole(String token) {
//        return getClaims(token).get("role", String.class);
//    }
//
//    public boolean isTokenExpired(String token) {
//        return getClaims(token).getExpiration().before(new Date());
//    }
//
//    public boolean validateToken(String token, UserDetails userDetails) {
//        return extractEmail(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
//    }
//}
//

@Component
public class JwtConfig {

    private final String secret = "mySuperSecretKey123!@#mySuperSecretKey123!@#"; // >=32 chars
    private final long expiration = 86400000; // 1 day

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String email, String role) {
        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractEmail(String token) {
        return getClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return getClaims(token).get("role", String.class);
    }

    public boolean isTokenExpired(String token) {
        return getClaims(token).getExpiration().before(new Date());
    }

    public boolean validateToken(String token, UserDetails userDetails) {
        return extractEmail(token).equals(userDetails.getUsername()) && !isTokenExpired(token);
    }
}
