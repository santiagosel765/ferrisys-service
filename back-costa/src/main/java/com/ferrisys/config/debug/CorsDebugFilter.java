package com.ferrisys.config.debug;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsDebugFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        log.info("[CORS-DEBUG] {} {} Origin={} ACRM={} ACRH={} Auth={}",
                request.getMethod(), request.getRequestURI(),
                request.getHeader("Origin"),
                request.getHeader("Access-Control-Request-Method"),
                request.getHeader("Access-Control-Request-Headers"),
                request.getHeader("Authorization"));
        chain.doFilter(req, res);
        log.info("[CORS-DEBUG-RESP] {} {} -> status={} ACAO={} ACAM={} ACAH={} ACAC={}",
                request.getMethod(), request.getRequestURI(), response.getStatus(),
                response.getHeader("Access-Control-Allow-Origin"),
                response.getHeader("Access-Control-Allow-Methods"),
                response.getHeader("Access-Control-Allow-Headers"),
                response.getHeader("Access-Control-Allow-Credentials"));
    }
}
