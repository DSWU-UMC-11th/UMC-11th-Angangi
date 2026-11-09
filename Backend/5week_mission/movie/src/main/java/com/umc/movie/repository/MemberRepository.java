package com.umc.movie.repository;

import com.umc.movie.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean existsByNickname(String nickname);
    boolean existsByEmail(String email);
    Optional<Member> findByEmail(String email);
    // 나를 뺀 다른 회원이 이 닉네임을 쓰는지 확인해요
    boolean existsByNicknameAndMemberIdNot(String nickname, Long memberId);
}
