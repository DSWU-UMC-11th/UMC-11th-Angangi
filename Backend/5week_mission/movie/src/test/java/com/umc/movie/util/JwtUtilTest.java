package com.umc.movie.util;

import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import io.jsonwebtoken.security.WeakKeyException;
import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {

    private static final String SECRET = "umc-movie-test-only-secret-key-at-least-32-bytes";

    private final JwtUtil jwtUtil = new JwtUtil(SECRET, 3600);

    private static void assertErrorCode(Runnable action, ErrorCode errorCode) {
        assertThatThrownBy(action::run)
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(errorCode));
    }

    private static String decode(String part) {
        return new String(Base64.getUrlDecoder().decode(part), StandardCharsets.UTF_8);
    }

    private static String encode(String json) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(json.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void 발급한_토큰에서_memberId를_꺼낸다() {
        String token = jwtUtil.createAccessToken(1L, "noco@umc.com");

        assertThat(token.split("\\.")).hasSize(3);
        assertThat(jwtUtil.getMemberId(token)).isEqualTo(1L);
    }

    @Test
    void payload는_비밀키_없이도_디코딩된다() {
        String token = jwtUtil.createAccessToken(1L, "noco@umc.com");

        assertThat(decode(token.split("\\.")[1]))
                .contains("\"sub\":\"1\"", "\"email\":\"noco@umc.com\"", "\"exp\"");
    }

    @Test
    void payload의_sub를_바꿔치기하면_서명_검증에_걸린다() {
        String[] parts = jwtUtil.createAccessToken(1L, "noco@umc.com").split("\\.");
        String forgedPayload = encode(decode(parts[1]).replace("\"sub\":\"1\"", "\"sub\":\"2\""));

        assertErrorCode(() -> jwtUtil.getMemberId(parts[0] + "." + forgedPayload + "." + parts[2]),
                ErrorCode.AUTH_TOKEN_INVALID);
    }

    @Test
    void 다른_비밀키로_서명한_토큰은_거절한다() {
        JwtUtil otherServer = new JwtUtil("another-secret-key-that-is-also-at-least-32-bytes", 3600);
        String token = otherServer.createAccessToken(1L, "noco@umc.com");

        assertErrorCode(() -> jwtUtil.getMemberId(token), ErrorCode.AUTH_TOKEN_INVALID);
    }

    @Test
    void 형식이_깨진_토큰은_거절한다() {
        assertErrorCode(() -> jwtUtil.getMemberId("not-a-jwt"), ErrorCode.AUTH_TOKEN_INVALID);
        assertErrorCode(() -> jwtUtil.getMemberId(""), ErrorCode.AUTH_TOKEN_INVALID);
    }

    @Test
    void 만료된_토큰은_위조와_구분해_AUTH401_4() {
        // 유효시간을 음수로 주면 발급하는 순간 이미 120초 전에 만료된 토큰이 돼요
        JwtUtil expiredIssuer = new JwtUtil(SECRET, -120);
        String token = expiredIssuer.createAccessToken(1L, "noco@umc.com");

        assertErrorCode(() -> jwtUtil.getMemberId(token), ErrorCode.AUTH_TOKEN_EXPIRED);
    }

    @Test
    void 만료되고_60초까지는_시계_오차_여유로_아직_통과한다() {
        // clockSkewSeconds(60) 때문에 JWT_ACCESS_EXPIRATION=60이면 실제로는 약 2분 뒤에 만료 응답이 나와요
        JwtUtil justExpiredIssuer = new JwtUtil(SECRET, -30);
        String token = justExpiredIssuer.createAccessToken(1L, "noco@umc.com");

        assertThat(jwtUtil.getMemberId(token)).isEqualTo(1L);
    }

    @Test
    void 비밀키가_32바이트보다_짧으면_만들_때_실패한다() {
        assertThatThrownBy(() -> new JwtUtil("too-short-secret", 3600))
                .isInstanceOf(WeakKeyException.class);
    }
}
