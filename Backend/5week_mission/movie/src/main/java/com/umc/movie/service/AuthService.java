package com.umc.movie.service;

import com.umc.movie.dto.LoginRequest;
import com.umc.movie.dto.LoginResponse;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class AuthService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    // 없는 이메일일 때도 bcrypt 비교를 한 번 해서, 응답 시간으로 가입 여부를 짐작하지 못하게 해요
    private final String dummyPasswordHash;

    public AuthService(MemberRepository memberRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.memberRepository = memberRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.dummyPasswordHash = passwordEncoder.encode("dummy-password-for-timing");
    }

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        Optional<Member> member = memberRepository.findByEmail(request.email());
        String passwordHash = member.map(Member::getPassword).orElse(dummyPasswordHash);

        // matches()는 저장된 해시에서 salt를 꺼내 입력값을 같은 방식으로 해시한 뒤 비교해요
        boolean passwordMatched = passwordEncoder.matches(request.password(), passwordHash);

        // 이메일이 없는 경우와 비밀번호가 틀린 경우를 같은 응답으로 합쳐요
        if (member.isEmpty() || !passwordMatched) {
            throw new BusinessException(ErrorCode.AUTH_LOGIN_FAILED);
        }

        Member loginMember = member.get();
        String accessToken = jwtUtil.createAccessToken(loginMember.getMemberId(), loginMember.getEmail());
        return new LoginResponse(loginMember.getNickname(), accessToken);
    }
}
