package com.umc.movie.config;

import com.umc.movie.interceptor.AuthInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;
    private final AuthInterceptor authInterceptor;

    public WebConfig(@Value("${cors.allowed-origins}") String[] allowedOrigins, AuthInterceptor authInterceptor) {
        this.allowedOrigins = allowedOrigins;
        this.authInterceptor = authInterceptor;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PATCH", "DELETE")
                .allowedHeaders("*"); // Authorization 헤더도 여기에 포함돼요
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(authInterceptor)
                // 전부 잠그고, 로그인 없이 써야 하는 경로만 열어요.
                // 새 API를 만들고 목록에 추가하는 걸 잊어도 잠긴 채로 남아서 안전한 쪽으로 실패해요.
                .addPathPatterns("/**")
                .excludePathPatterns(
                        "/auth/**",             // 로그인
                        "/members",             // 회원가입 (POST /members)
                        "/members/nickname/**", // 닉네임 중복 확인
                        "/members/email/**",    // 이메일 중복 확인
                        "/members/*/ratings",   // 유저별 평점 목록 (공개)
                        "/error"
                );
    }
}
