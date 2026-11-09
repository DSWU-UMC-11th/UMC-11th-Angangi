package com.umc.movie.service;

import com.umc.movie.dto.LoginRequest;
import com.umc.movie.dto.LoginResponse;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.spy;
import static org.mockito.Mockito.verify;

class AuthServiceTest {

    private static final String EMAIL = "noco@umc.com";
    private static final String PASSWORD = "Umc!1234";

    private MemberRepository memberRepository;
    private PasswordEncoder passwordEncoder;
    private JwtUtil jwtUtil;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        memberRepository = mock(MemberRepository.class);
        passwordEncoder = spy(new BCryptPasswordEncoder());
        jwtUtil = new JwtUtil("umc-movie-test-only-secret-key-at-least-32-bytes", 3600);
        authService = new AuthService(memberRepository, passwordEncoder, jwtUtil);

        Member member = Member.builder()
                .email(EMAIL)
                .password(new BCryptPasswordEncoder().encode(PASSWORD))
                .nickname("수현")
                .build();
        ReflectionTestUtils.setField(member, "memberId", 1L);
        given(memberRepository.findByEmail(EMAIL)).willReturn(Optional.of(member));
    }

    private static void assertLoginFailed(Runnable action) {
        assertThatThrownBy(action::run)
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.AUTH_LOGIN_FAILED));
    }

    @Test
    void 비밀번호가_맞으면_닉네임과_그_회원의_토큰을_돌려준다() {
        LoginResponse response = authService.login(new LoginRequest(EMAIL, PASSWORD));

        assertThat(response.nickname()).isEqualTo("수현");
        assertThat(jwtUtil.getMemberId(response.accessToken())).isEqualTo(1L);
    }

    @Test
    void 비밀번호가_틀리면_AUTH401_1() {
        assertLoginFailed(() -> authService.login(new LoginRequest(EMAIL, "Wrong!1234")));
    }

    @Test
    void 없는_이메일도_같은_AUTH401_1이고_비밀번호_비교를_똑같이_거친다() {
        given(memberRepository.findByEmail("nobody@umc.com")).willReturn(Optional.empty());

        assertLoginFailed(() -> authService.login(new LoginRequest("nobody@umc.com", PASSWORD)));
        verify(passwordEncoder).matches(eq(PASSWORD), anyString());
    }
}
