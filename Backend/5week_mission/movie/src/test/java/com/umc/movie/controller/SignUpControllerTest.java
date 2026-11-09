package com.umc.movie.controller;

import com.umc.movie.dto.MemberResponse;
import com.umc.movie.dto.SignUpRequest;
import com.umc.movie.service.MemberService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MemberController.class)
class SignUpControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MemberService memberService;

    private static String body(String email, String password, String nickname) {
        return """
                {"email": "%s", "password": "%s", "nickname": "%s"}
                """.formatted(email, password, nickname);
    }

    @Test
    void 회원가입에_성공하면_201과_비밀번호_없는_회원_정보를_응답한다() throws Exception {
        given(memberService.signUp(any(SignUpRequest.class)))
                .willReturn(new MemberResponse(1L, "umc@example.com", "moviefan"));

        mockMvc.perform(post("/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("umc@example.com", "Umc!1234", "moviefan")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.message").value("회원가입에 성공했습니다."))
                .andExpect(jsonPath("$.result.memberId").value(1))
                .andExpect(jsonPath("$.result.email").value("umc@example.com"))
                .andExpect(jsonPath("$.result.nickname").value("moviefan"))
                .andExpect(jsonPath("$.result.password").doesNotExist());
    }

    @ParameterizedTest
    @ValueSource(strings = {"umc1234!", "UMC1234!", "Umcabcd!", "Umc12345", "Um!1"})
    void 비밀번호_규칙을_지키지_않으면_400을_응답한다(String password) throws Exception {
        mockMvc.perform(post("/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("umc@example.com", password, "moviefan")))
                .andExpect(status().isBadRequest());

        verify(memberService, never()).signUp(any());
    }

    @Test
    void 이메일_형식이_아니거나_닉네임이_짧으면_400을_응답한다() throws Exception {
        mockMvc.perform(post("/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("not-an-email", "Umc!1234", "moviefan")))
                .andExpect(status().isBadRequest());
        mockMvc.perform(post("/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body("umc@example.com", "Umc!1234", "a")))
                .andExpect(status().isBadRequest());

        verify(memberService, never()).signUp(any());
    }
}
