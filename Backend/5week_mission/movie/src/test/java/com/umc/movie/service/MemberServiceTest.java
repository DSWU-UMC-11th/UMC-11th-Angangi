package com.umc.movie.service;

import com.umc.movie.dto.MemberInfoResponse;
import com.umc.movie.dto.MemberResponse;
import com.umc.movie.dto.MemberUpdateRequest;
import com.umc.movie.dto.SignUpRequest;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.lang.reflect.RecordComponent;
import java.util.Optional;

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
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MEMBER_EMAIL_DUPLICATED));
        verify(memberRepository, never()).save(any());
    }

    @Test
    void 내_정보는_비밀번호_없이_이메일_닉네임_가입일만_돌려준다() {
        Member member = Member.builder().email("noco@umc.com").password("hash").nickname("수현").build();
        given(memberRepository.findById(1L)).willReturn(Optional.of(member));

        MemberInfoResponse response = memberService.getMyInfo(1L);

        assertThat(response.email()).isEqualTo("noco@umc.com");
        assertThat(response.nickname()).isEqualTo("수현");
        assertThat(MemberInfoResponse.class.getRecordComponents())
                .extracting(RecordComponent::getName)
                .containsExactly("email", "nickname", "createdAt");
    }

    @Test
    void 토큰의_회원이_없어졌으면_MEMBER404_1() {
        given(memberRepository.findById(99L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> memberService.getMyInfo(99L))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MEMBER_NOT_FOUND));
    }

    @Test
    void 닉네임을_바꾸면_엔티티가_바뀌고_save는_부르지_않는다() {
        Member member = Member.builder().email("noco@umc.com").password("hash").nickname("수현").build();
        given(memberRepository.findById(1L)).willReturn(Optional.of(member));

        MemberInfoResponse response = memberService.updateMyInfo(1L, new MemberUpdateRequest("영화조아"));

        assertThat(member.getNickname()).isEqualTo("영화조아");
        assertThat(response.nickname()).isEqualTo("영화조아");
        verify(memberRepository, never()).save(any());
    }

    @Test
    void 지금_내_닉네임을_그대로_보내면_중복으로_막지_않는다() {
        Member member = Member.builder().email("noco@umc.com").password("hash").nickname("수현").build();
        given(memberRepository.findById(1L)).willReturn(Optional.of(member));
        // existsByNickname("수현")은 true지만, 나를 뺀 조회는 false예요
        given(memberRepository.existsByNickname("수현")).willReturn(true);
        given(memberRepository.existsByNicknameAndMemberIdNot("수현", 1L)).willReturn(false);

        assertThat(memberService.updateMyInfo(1L, new MemberUpdateRequest("수현")).nickname()).isEqualTo("수현");
    }

    @Test
    void 다른_회원이_쓰는_닉네임이면_MEMBER4092이고_바꾸지_않는다() {
        Member member = Member.builder().email("noco@umc.com").password("hash").nickname("수현").build();
        given(memberRepository.findById(1L)).willReturn(Optional.of(member));
        given(memberRepository.existsByNicknameAndMemberIdNot("민서", 1L)).willReturn(true);

        assertThatThrownBy(() -> memberService.updateMyInfo(1L, new MemberUpdateRequest("민서")))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MEMBER_NICKNAME_DUPLICATED));
        assertThat(member.getNickname()).isEqualTo("수현");
    }

    @Test
    void 이미_사용_중인_닉네임이면_저장하지_않는다() {
        given(memberRepository.existsByNickname("moviefan")).willReturn(true);

        assertThatThrownBy(() -> memberService.signUp(REQUEST))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.MEMBER_NICKNAME_DUPLICATED));
        verify(memberRepository, never()).save(any());
    }
}
