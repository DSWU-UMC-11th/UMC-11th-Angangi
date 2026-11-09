package com.umc.movie.controller;

import com.umc.movie.dto.SignUpRequest;
import com.umc.movie.service.MemberService;
import com.umc.movie.service.RatingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({MemberController.class, RatingController.class})
class GlobalExceptionHandlerTest {

    private static final String VALID_SIGN_UP = """
            {"email": "umc@example.com", "password": "Umc!1234", "nickname": "moviefan"}
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private MemberService memberService;

    @MockitoBean
    private RatingService ratingService;

    private ResultActions signUp(String body) throws Exception {
        return mockMvc.perform(post("/members").contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private static void expectFailure(ResultActions result, String code, String message) throws Exception {
        result.andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.code").value(code))
                .andExpect(jsonPath("$.message").value(message))
                .andExpect(jsonPath("$.result").isEmpty());
    }

    @Test
    void 요청_DTO_검증에_실패하면_400과_첫_번째_실패_메시지를_응답한다() throws Exception {
        ResultActions result = signUp("""
                {"email": "umc@example.com", "password": "Umc!1234", "nickname": "a"}
                """).andExpect(status().isBadRequest());

        expectFailure(result, "COMMON4001", "닉네임은 2자 이상 12자 이하로 입력해주세요.");
    }

    @Test
    void 경로_변수와_쿼리_파라미터_검증에_실패해도_같은_형식으로_응답한다() throws Exception {
        expectFailure(mockMvc.perform(get("/members/email/{email}", "noco")).andExpect(status().isBadRequest()),
                "COMMON4001", "올바른 이메일 형식이 아닙니다.");

        expectFailure(mockMvc.perform(get("/members/{id}/ratings", 1).param("size", "51"))
                        .andExpect(status().isBadRequest()),
                "COMMON4001", "size는 50 이하여야 합니다.");
    }

    @Test
    void 요청_본문_JSON이_깨지면_400을_응답한다() throws Exception {
        ResultActions result = signUp("{\"email\": ").andExpect(status().isBadRequest());

        expectFailure(result, "COMMON4001", "요청 본문의 형식이 올바르지 않습니다.");
    }

    @Test
    void 서비스의_중복_검사에_걸리면_409와_서비스_메시지를_응답한다() throws Exception {
        given(memberService.signUp(any(SignUpRequest.class)))
                .willThrow(new IllegalArgumentException("이미 사용 중인 이메일입니다."));

        expectFailure(signUp(VALID_SIGN_UP).andExpect(status().isConflict()),
                "COMMON4092", "이미 사용 중인 이메일입니다.");
    }

    @Test
    void DB_제약_조건에_걸리면_409를_응답한다() throws Exception {
        given(memberService.signUp(any(SignUpRequest.class)))
                .willThrow(new DataIntegrityViolationException("Duplicate entry"));

        expectFailure(signUp(VALID_SIGN_UP).andExpect(status().isConflict()),
                "COMMON4091", "이미 존재하는 데이터입니다.");
    }

    @Test
    void ResponseStatusException은_상태_코드와_사유를_그대로_담아_응답한다() throws Exception {
        given(ratingService.getRatingsByMember(999L, 0, 10))
                .willThrow(new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 유저입니다."));

        expectFailure(mockMvc.perform(get("/members/{id}/ratings", 999)).andExpect(status().isNotFound()),
                "COMMON404", "존재하지 않는 유저입니다.");
    }
}
