package com.umc.movie.interceptor;

import com.umc.movie.controller.MemberController;
import com.umc.movie.controller.RatingController;
import com.umc.movie.dto.NicknameCheckResponse;
import com.umc.movie.service.MemberService;
import com.umc.movie.service.RatingService;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(JwtUtil.class)
@WebMvcTest({MemberController.class, RatingController.class})
class AuthInterceptorTest {

    // 평점 삭제를 "잠긴 API" 예시로 써요
    private static final String PROTECTED_URL = "/ratings/4";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @MockitoBean
    private MemberService memberService;

    @MockitoBean
    private RatingService ratingService;

    private static void expectUnauthorized(ResultActions result, String code, String message) throws Exception {
        result.andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.code").value(code))
                .andExpect(jsonPath("$.message").value(message));
    }

    @Test
    void 토큰_없이_잠긴_API를_부르면_컨트롤러까지_가지_않고_AUTH401_2() throws Exception {
        expectUnauthorized(mockMvc.perform(delete(PROTECTED_URL)), "AUTH401_2", "로그인이 필요한 요청입니다.");

        verify(ratingService, never()).delete(anyLong(), anyLong());
    }

    @Test
    void Bearer_형식이_아니면_토큰이_없는_것으로_본다() throws Exception {
        String token = jwtUtil.createAccessToken(1L, "noco@umc.com");

        expectUnauthorized(mockMvc.perform(delete(PROTECTED_URL).header(HttpHeaders.AUTHORIZATION, token)),
                "AUTH401_2", "로그인이 필요한 요청입니다.");
        expectUnauthorized(mockMvc.perform(delete(PROTECTED_URL).header(HttpHeaders.AUTHORIZATION, "Basic " + token)),
                "AUTH401_2", "로그인이 필요한 요청입니다.");
    }

    @Test
    void 위조된_토큰은_AUTH401_3() throws Exception {
        String token = jwtUtil.createAccessToken(1L, "noco@umc.com");
        // payload 가운데 글자 하나를 다른 글자로 바꿔요 (덧붙이면 Base64 자투리로 무시될 수 있어요)
        int index = token.indexOf('.') + 10;
        char replaced = token.charAt(index) == 'A' ? 'B' : 'A';
        String forged = token.substring(0, index) + replaced + token.substring(index + 1);

        expectUnauthorized(mockMvc.perform(delete(PROTECTED_URL).header(HttpHeaders.AUTHORIZATION, "Bearer " + forged)),
                "AUTH401_3", "유효하지 않은 토큰입니다.");
    }

    @Test
    void 만료된_토큰은_토큰이_없을_때와_다른_AUTH401_4() throws Exception {
        String expired = new JwtUtil("umc-movie-test-only-secret-key-at-least-32-bytes", -120)
                .createAccessToken(1L, "noco@umc.com");

        expectUnauthorized(mockMvc.perform(delete(PROTECTED_URL).header(HttpHeaders.AUTHORIZATION, "Bearer " + expired)),
                "AUTH401_4", "토큰이 만료되었습니다. 다시 로그인해주세요.");
    }

    @Test
    void 유효한_토큰이면_컨트롤러까지_통과한다() throws Exception {
        String token = jwtUtil.createAccessToken(1L, "noco@umc.com");

        mockMvc.perform(delete(PROTECTED_URL).header(HttpHeaders.AUTHORIZATION, "Bearer " + token))
                .andExpect(status().is2xxSuccessful());
    }

    @Test
    void 공개_API는_토큰_없이도_열려_있다() throws Exception {
        given(memberService.checkNickname(anyString())).willReturn(new NicknameCheckResponse(true));

        mockMvc.perform(get("/members/nickname/noco")).andExpect(status().isOk());
        mockMvc.perform(get("/members/1/ratings")).andExpect(status().isOk());
    }

    @Test
    void CORS_preflight는_토큰이_없어도_막지_않는다() throws Exception {
        mockMvc.perform(options(PROTECTED_URL)
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "DELETE")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "authorization"));
    }

    @Test
    void 없는_경로는_401이_아니라_404() throws Exception {
        mockMvc.perform(get("/nope")).andExpect(status().isNotFound());
    }
}
