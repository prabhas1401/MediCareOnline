package com.medicare.service;

import java.util.Date;

import org.springframework.stereotype.Service;

import com.medicare.entity.User;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Service
public class TokenService {

    private final String SECRET_KEY = "SuperSecretJWTIsModifiedtoMinimum32Characters";
    private final long EXPIRATION_MS = 5*3600000; 

    @SuppressWarnings("deprecation")
	public String generateToken(User user) {
        return Jwts.builder()
                .setSubject(user.getUserId().toString())
                .claim("role", user.getRole().name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
                .signWith(SignatureAlgorithm.HS256, SECRET_KEY.getBytes())

                .compact();
    }
    

    public boolean validateToken(String token) {
        try {
            JwtParser parser = Jwts.parserBuilder()
                    .setSigningKey(SECRET_KEY.getBytes())
                    .build();
            parser.parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public Long getUserIdFromToken(String token) {
        JwtParser parser = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY.getBytes())
                .build();
        Claims claims = parser.parseClaimsJws(token).getBody();
        return Long.parseLong(claims.getSubject());
    }

    public String getRoleFromToken(String token) {
    	JwtParser parser = Jwts.parserBuilder()
                .setSigningKey(SECRET_KEY.getBytes())
                .build();
        Claims claims = parser.parseClaimsJws(token).getBody();
        return claims.get("role", String.class);
    }
    

}