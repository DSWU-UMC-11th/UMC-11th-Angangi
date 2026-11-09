package com.umc.movie.controller;

import com.umc.movie.dto.MemberInfoResponse;
import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.service.MemberService;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(JwtUtil.class)
@WebMvcTest(MemberController.class)
class MyInfoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @MockitoBean
    private MemberService memberService;

    private String bearer(Long memberId) {
        return "Bearer " + jwtUtil.createAccessToken(memberId, "member" + memberId + "@umc.com");
    }

    @Test
    void 토큰의_주인_정보를_200으로_응답한다() throws Exception {
        given(memberService.getMyInfo(1L))
                .willReturn(new MemberInfoResponse("noco@umc.com", "수현", LocalDateTime.of(2026, 9, 2, 21, 14, 3)));

        mockMvc.perform(get("/members/me").header(HttpHeaders.AUTHORIZATION, bearer(1L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("COMMON200"))
                .andExpect(jsonPath("$.message").value("회원 정보를 조회했습니다."))
                .andExpect(jsonPath("$.result.email").value("noco@umc.com"))
                .andExpect(jsonPath("$.result.nickname").value("수현"))
                .andExpect(jsonPath("$.result.createdAt").value("2026-09-02T21:14:03"))
                .andExpect(jsonPath("$.result.password").doesNotExist());
    }

    @Test
    void 누구의_정보인지는_URL이_아니라_토큰이_정한다() throws Exception {
        given(memberService.getMyInfo(2L))
                .willReturn(new MemberInfoResponse("minseo@umc.com", "민서", LocalDateTime.now()));

        mockMvc.perform(get("/members/me").header(HttpHeaders.AUTHORIZATION, bearer(2L)))
                .andExpect(jsonPath("$.result.nickname").value("민서"));

        verify(memberService).getMyInfo(2L);
    }

    @Test
    void 토큰_없이_부르면_401() throws Exception {
        mockMvc.perform(get("/members/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));

        verify(memberService, never()).getMyInfo(anyLong());
    }

    @Test
    void 토큰은_유효한데_회원이_없으면_404() throws Exception {
        given(memberService.getMyInfo(99L)).willThrow(new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        mockMvc.perform(get("/members/me").header(HttpHeaders.AUTHORIZATION, bearer(99L)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("MEMBER404_1"))
                .andExpect(jsonPath("$.message").value("해당 회원을 찾을 수 없습니다."));
    }
}
