package com.umc.movie.controller;

import com.umc.movie.dto.EmailCheckResponse;
import com.umc.movie.dto.NicknameCheckResponse;
import com.umc.movie.service.MemberService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(MemberController.class)
class MemberControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MemberService memberService;

    @Test
    void 닉네임이_2에서_12자면_중복_여부를_응답한다() throws Exception {
        given(memberService.checkNickname("수현")).willReturn(new NicknameCheckResponse(false));

        mockMvc.perform(get("/members/nickname/{nickname}", "수현"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    void 닉네임이_2자_미만이면_400을_응답한다() throws Exception {
        mockMvc.perform(get("/members/nickname/{nickname}", "a"))
                .andExpect(status().isBadRequest());

        verify(memberService, never()).checkNickname(anyString());
    }

    @Test
    void 닉네임이_12자를_넘으면_400을_응답한다() throws Exception {
        mockMvc.perform(get("/members/nickname/{nickname}", "가나다라마바사아자차카타파"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void 이메일_형식이면_중복_여부를_응답한다() throws Exception {
        given(memberService.checkEmail("noco@umc.com")).willReturn(new EmailCheckResponse(false));

        mockMvc.perform(get("/members/email/{email}", "noco@umc.com"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    void 이메일_형식이_아니면_400을_응답한다() throws Exception {
        mockMvc.perform(get("/members/email/{email}", "noco"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/members/email/{email}", "noco@umc"))
                .andExpect(status().isBadRequest());

        verify(memberService, never()).checkEmail(anyString());
    }

    @Test
    void 허용한_출처의_요청에는_CORS_헤더를_붙인다() throws Exception {
        given(memberService.checkNickname("수현")).willReturn(new NicknameCheckResponse(false));

        mockMvc.perform(get("/members/nickname/{nickname}", "수현")
                        .header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"));
    }

    @Test
    void 허용하지_않은_출처의_요청은_403으로_거부한다() throws Exception {
        mockMvc.perform(get("/members/nickname/{nickname}", "수현")
                        .header("Origin", "http://localhost:3001"))
                .andExpect(status().isForbidden());
    }
}
