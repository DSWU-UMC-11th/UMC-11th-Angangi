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

        boolean passwordMatched = passwordEncoder.matches(request.password(), passwordHash);

        if (member.isEmpty() || !passwordMatched) {
            throw new BusinessException(ErrorCode.AUTH_LOGIN_FAILED);
        }

        Member loginMember = member.get();
        String accessToken = jwtUtil.createAccessToken(loginMember.getMemberId(), loginMember.getEmail());
        return new LoginResponse(loginMember.getNickname(), accessToken);
    }
}
