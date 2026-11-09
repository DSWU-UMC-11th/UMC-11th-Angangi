package com.umc.movie.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "이메일을 입력해주세요.")
        @Email(message = "이메일 형식이 올바르지 않습니다.")
        String email,

        // 로그인에서는 비밀번호 규칙을 다시 검사하지 않아요.
        // 규칙이 바뀌기 전에 가입한 회원도 로그인할 수 있어야 하고, 맞는지는 해시 비교가 판단해요.
        @NotBlank(message = "비밀번호를 입력해주세요.")
        String password
) {
}
