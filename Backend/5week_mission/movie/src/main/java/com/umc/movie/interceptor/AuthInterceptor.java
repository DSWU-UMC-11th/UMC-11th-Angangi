package com.umc.movie.interceptor;

import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
@RequiredArgsConstructor
public class AuthInterceptor implements HandlerInterceptor {

    public static final String MEMBER_ID = "memberId"; // 컨트롤러에서 꺼낼 때 쓰는 이름
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtUtil jwtUtil;

    /**
     * 컨트롤러가 실행되기 전에 호출돼요.
     * true를 반환하면 컨트롤러로 이어지고, 예외를 던지면 전역 핸들러가 실패 응답으로 바꿔요.
     */
    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 컨트롤러 메서드로 가는 요청만 검사해요.
        // CORS preflight(OPTIONS)는 PreFlightHandler가, 없는 경로는 ResourceHttpRequestHandler가 처리하므로
        // 여기서 통과시켜야 preflight가 막히지 않고 없는 경로도 401이 아닌 404로 응답돼요.
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith(BEARER_PREFIX)) {
            throw new BusinessException(ErrorCode.AUTH_TOKEN_MISSING);
        }

        // 검증에 실패하면 JwtUtil이 AUTH401_3/AUTH401_4를 던지므로, 다음 줄까지 오면 유효한 토큰이에요
        Long memberId = jwtUtil.getMemberId(header.substring(BEARER_PREFIX.length()));
        request.setAttribute(MEMBER_ID, memberId);
        return true;
    }
}
