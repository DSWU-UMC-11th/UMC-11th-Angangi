package com.umc.movie.auth;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 로그인한 회원의 memberId를 받는 파라미터에 붙여요.
 * 값은 요청이 아니라 AuthInterceptor가 검증한 토큰에서 와요.
 */
@Target(ElementType.PARAMETER)
@Retention(RetentionPolicy.RUNTIME) // 실행 중에 리졸버가 읽어야 해서 RUNTIME이에요
public @interface LoginMember {
}
