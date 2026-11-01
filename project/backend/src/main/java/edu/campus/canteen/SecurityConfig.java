package edu.campus.canteen;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {
 @Bean SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
   return http.csrf(c -> c.disable()).cors(Customizer.withDefaults())
    .authorizeHttpRequests(a -> a.requestMatchers("/api/health","/actuator/health","/api/webhooks/razorpay").permitAll()
      .requestMatchers(HttpMethod.GET,"/api/menu","/api/categories","/api/config").permitAll()
      .anyRequest().authenticated())
    .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults())).build();
 }

 /**
  * Validates Supabase access tokens.
  * - New Supabase projects sign tokens with asymmetric keys (ES256/RS256): verified through the public JWKS URL.
  * - Older projects use a shared HS256 secret: set SUPABASE_JWT_SECRET (Project Settings > JWT) to use it.
  */
 @Bean JwtDecoder jwtDecoder(@Value("${app.supabase-url}") String supabaseUrl,
                             @Value("${app.jwt-issuer}") String issuer,
                             @Value("${app.jwt-secret:}") String secret) {
   NimbusJwtDecoder decoder;
   if (secret != null && !secret.isBlank()) {
     decoder = NimbusJwtDecoder.withSecretKey(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"))
       .macAlgorithm(MacAlgorithm.HS256).build();
   } else {
     String base = supabaseUrl.endsWith("/") ? supabaseUrl.substring(0, supabaseUrl.length() - 1) : supabaseUrl;
     decoder = NimbusJwtDecoder.withJwkSetUri(base + "/auth/v1/.well-known/jwks.json")
       .jwsAlgorithm(SignatureAlgorithm.ES256).jwsAlgorithm(SignatureAlgorithm.RS256).build();
   }
   OAuth2TokenValidator<Jwt> audience = jwt -> jwt.getAudience() != null && jwt.getAudience().contains("authenticated")
     ? OAuth2TokenValidatorResult.success()
     : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Token audience is not 'authenticated'", null));
   decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefaultWithIssuer(issuer), audience));
   return decoder;
 }

 @Bean CorsConfigurationSource corsConfigurationSource(@Value("${app.cors-origins}") String origins) {
   CorsConfiguration c = new CorsConfiguration();
   c.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).filter(x -> !x.isEmpty())
     .map(x -> x.endsWith("/") ? x.substring(0, x.length() - 1) : x).toList());
   c.setAllowedMethods(List.of("GET","POST","PUT","PATCH","DELETE","OPTIONS"));
   c.setAllowedHeaders(List.of("Authorization","Content-Type","Accept")); c.setAllowCredentials(false);
   UrlBasedCorsConfigurationSource s = new UrlBasedCorsConfigurationSource(); s.registerCorsConfiguration("/**",c); return s;
 }
}
