package com.ferrisys.config.security;

import com.ferrisys.config.security.filter.JwtFilterRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

@Configuration
public class SecurityConfig {

	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http, JwtFilterRequest jwtFilterRequest) throws Exception {
		http.csrf(AbstractHttpConfigurer::disable);
		http.authorizeHttpRequests(auth -> auth
						.requestMatchers("/v1/auth/login", "/v1/auth/register", "/actuator/health").permitAll()
						.anyRequest().authenticated()
				)
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.addFilterBefore(jwtFilterRequest, UsernamePasswordAuthenticationFilter.class);
		http.headers(headers -> headers
				.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
		);
		http.cors(cors -> cors.configurationSource(request -> {
			CorsConfiguration configuration = new CorsConfiguration();
			configuration.setAllowedOrigins(List.of("https://clarifyerp.qbit-gt.com", "http://localhost:4200"));
			configuration.setAllowedMethods(List.of(
					"GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
			));
			configuration.setAllowedHeaders(List.of(
					"Authorization", "Content-Type", "Accept"
			));
			configuration.setExposedHeaders(List.of(
					"Authorization", "Content-Type", "Accept"
			));
			configuration.setMaxAge(3600L);
			return configuration;
		}));
		return http.build();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
		return authConfig.getAuthenticationManager();
	}
}