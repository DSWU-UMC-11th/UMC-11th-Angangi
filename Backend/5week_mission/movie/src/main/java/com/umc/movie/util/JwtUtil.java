package com.umc.movie.util;

import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtUtil {

    // 서버와 클라이언트 시계가 조금 어긋나도 만료로 판단하지 않도록 두는 여유
    private static final long CLOCK_SKEW_SECONDS = 60;

    private final SecretKey secretKey;
    private final Duration accessExpiration;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-expiration}") long accessExpirationSeconds
    ) {
        // 32바이트보다 짧은 키는 HMAC-SHA에 쓸 수 없어서 여기서 WeakKeyException이 나요
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessExpiration = Duration.ofSeconds(accessExpirationSeconds);
    }

    public String createAccessToken(Long memberId, String email) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(String.valueOf(memberId)) // 토큰의 주인. 서버는 이 값만 믿고 요청자를 정해요
                .claim("email", email)             // 참고용 정보. 비밀번호 같은 민감한 값은 넣지 않아요
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(accessExpiration)))
                .signWith(secretKey)
                .compact();
    }

    /**
     * 서명과 만료 시각을 검증하고 memberId를 꺼내요.
     * 값을 돌려줬다면 검증까지 통과한 토큰이에요.
     */
    public Long getMemberId(String token) {
        try {
            return Long.valueOf(parseClaims(token).getSubject());
        } catch (ExpiredJwtException exception) {
            // 다시 로그인하면 해결되는 상황이라 위조와 구분해요
            throw new BusinessException(ErrorCode.AUTH_TOKEN_EXPIRED);
        } catch (JwtException | IllegalArgumentException exception) {
            // 서명 불일치, 형식 오류, subject가 숫자가 아닌 경우(NumberFormatException) 모두 여기로 와요
            throw new BusinessException(ErrorCode.AUTH_TOKEN_INVALID);
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .clockSkewSeconds(CLOCK_SKEW_SECONDS)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
