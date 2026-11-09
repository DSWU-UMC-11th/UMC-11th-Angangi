package com.umc.movie.service;

import com.umc.movie.dto.MemberResponse;
import com.umc.movie.dto.SignUpRequest;
import com.umc.movie.entity.Member;
import com.umc.movie.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class MemberServiceTest {

    private static final SignUpRequest REQUEST =
            new SignUpRequest("umc@example.com", "Umc!1234", "moviefan");

    private MemberRepository memberRepository;
    private PasswordEncoder passwordEncoder;
    private MemberService memberService;

    @BeforeEach
    void setUp() {
        memberRepository = mock(MemberRepository.class);
        passwordEncoder = new BCryptPasswordEncoder();
        memberService = new MemberService(memberRepository, passwordEncoder);
    }

    @Test
    void 비밀번호를_bcrypt_해시로_저장하고_응답에는_비밀번호를_담지_않는다() {
        given(memberRepository.save(any(Member.class))).willAnswer(invocation -> invocation.getArgument(0));

        MemberResponse response = memberService.signUp(REQUEST);

        ArgumentCaptor<Member> captor = ArgumentCaptor.forClass(Member.class);
        verify(memberRepository).save(captor.capture());
        String savedPassword = captor.getValue().getPassword();

        assertThat(savedPassword).isNotEqualTo("Umc!1234").hasSize(60).startsWith("$2a$");
        assertThat(passwordEncoder.matches("Umc!1234", savedPassword)).isTrue();
        assertThat(response.email()).isEqualTo("umc@example.com");
        assertThat(response.nickname()).isEqualTo("moviefan");
    }

    @Test
    void 이미_사용_중인_이메일이면_저장하지_않는다() {
        given(memberRepository.existsByEmail("umc@example.com")).willReturn(true);

        assertThatThrownBy(() -> memberService.signUp(REQUEST))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("이미 사용 중인 이메일입니다.");
        verify(memberRepository, never()).save(any());
    }

    @Test
    void 이미_사용_중인_닉네임이면_저장하지_않는다() {
        given(memberRepository.existsByNickname("moviefan")).willReturn(true);

        assertThatThrownBy(() -> memberService.signUp(REQUEST))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("이미 사용 중인 닉네임입니다.");
        verify(memberRepository, never()).save(any());
    }
}
