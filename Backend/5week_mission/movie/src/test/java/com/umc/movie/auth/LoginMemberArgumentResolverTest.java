package com.umc.movie.auth;

import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.interceptor.AuthInterceptor;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.context.request.ServletWebRequest;

import java.lang.reflect.Method;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LoginMemberArgumentResolverTest {

    private final LoginMemberArgumentResolver resolver = new LoginMemberArgumentResolver();

    @SuppressWarnings("unused")
    private void handler(@LoginMember Long loginMemberId, Long plainId, @LoginMember String wrongType) {
    }

    private static MethodParameter parameter(int index) throws NoSuchMethodException {
        Method method = LoginMemberArgumentResolverTest.class
                .getDeclaredMethod("handler", Long.class, Long.class, String.class);
        return new MethodParameter(method, index);
    }

    @Test
    void LoginMember가_붙은_Long_파라미터만_맡는다() throws Exception {
        assertThat(resolver.supportsParameter(parameter(0))).isTrue();
        assertThat(resolver.supportsParameter(parameter(1))).isFalse();
        assertThat(resolver.supportsParameter(parameter(2))).isFalse();
    }

    @Test
    void 인터셉터가_담아_둔_memberId를_꺼낸다() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setAttribute(AuthInterceptor.MEMBER_ID, 7L);

        Long memberId = resolver.resolveArgument(parameter(0), null, new ServletWebRequest(request), null);

        assertThat(memberId).isEqualTo(7L);
    }

    @Test
    void 인터셉터를_거치지_않아_값이_없으면_500이_아니라_AUTH401_2() {
        ServletWebRequest request = new ServletWebRequest(new MockHttpServletRequest());

        assertThatThrownBy(() -> resolver.resolveArgument(parameter(0), null, request, null))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.AUTH_TOKEN_MISSING));
    }
}
