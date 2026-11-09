package com.umc.movie.controller;

import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.RatingResponse;
import com.umc.movie.dto.UpdateRatingRequest;
import com.umc.movie.service.RatingService;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(JwtUtil.class)
@WebMvcTest(RatingController.class)
class RatingCommandControllerTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 9, 12, 0);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @MockitoBean
    private RatingService ratingService;

    private String bearer(Long memberId) {
        return "Bearer " + jwtUtil.createAccessToken(memberId, "member" + memberId + "@umc.com");
    }

    @Test
    void 평점을_등록하면_201과_등록한_평점을_응답한다() throws Exception {
        given(ratingService.create(eq(1L), any(CreateRatingRequest.class)))
                .willReturn(new RatingResponse(4L, 680L, 5, "대사가 기억에 남아요", NOW, NOW));

        mockMvc.perform(post("/ratings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"movieId": 680, "score": 5, "comment": "대사가 기억에 남아요"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.message").value("평점 등록에 성공했습니다."))
                .andExpect(jsonPath("$.result.ratingId").value(4))
                .andExpect(jsonPath("$.result.movieId").value(680));
    }

    @Test
    void 바디에_memberId를_넣어도_무시하고_토큰의_회원으로_등록한다() throws Exception {
        mockMvc.perform(post("/ratings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"memberId": 2, "movieId": 680, "score": 5}
                                """))
                .andExpect(status().isCreated());

        verify(ratingService).create(eq(1L), any(CreateRatingRequest.class));
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', value = {
            "{\"score\": 5}|영화 ID를 입력해주세요.",
            "{\"movieId\": -1, \"score\": 5}|영화 ID는 양수여야 합니다.",
            "{\"movieId\": 680}|별점을 입력해주세요.",
            "{\"movieId\": 680, \"score\": 0}|별점은 1점 이상이어야 합니다.",
            "{\"movieId\": 680, \"score\": 6}|별점은 5점 이하여야 합니다."
    })
    void 평점_등록_입력이_잘못되면_400과_이유를_응답한다(String body, String message) throws Exception {
        mockMvc.perform(post("/ratings")
                        .header(HttpHeaders.AUTHORIZATION, bearer(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("COMMON4001"))
                .andExpect(jsonPath("$.message").value(message));

        verify(ratingService, never()).create(anyLong(), any());
    }

    @Test
    void 후기가_500자를_넘으면_400() throws Exception {
        String longComment = "가".repeat(501);

        mockMvc.perform(patch("/ratings/4")
                        .header(HttpHeaders.AUTHORIZATION, bearer(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\": 4, \"comment\": \"" + longComment + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("후기는 500자 이하로 입력해주세요."));
    }

    @Test
    void 평점을_수정하면_200과_수정된_평점을_응답한다() throws Exception {
        given(ratingService.update(eq(1L), eq(4L), any(UpdateRatingRequest.class)))
                .willReturn(new RatingResponse(4L, 680L, 4, "다시 보니 괜찮아요", NOW, NOW.plusHours(1)));

        mockMvc.perform(patch("/ratings/4")
                        .header(HttpHeaders.AUTHORIZATION, bearer(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\": 4, \"comment\": \"다시 보니 괜찮아요\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("COMMON200"))
                .andExpect(jsonPath("$.message").value("평점 수정에 성공했습니다."))
                .andExpect(jsonPath("$.result.score").value(4))
                .andExpect(jsonPath("$.result.updatedAt").value("2026-11-09T13:00:00"));
    }

    @Test
    void 평점을_삭제하면_204가_아니라_200과_공통_형식으로_응답한다() throws Exception {
        mockMvc.perform(delete("/ratings/4").header(HttpHeaders.AUTHORIZATION, bearer(1L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.code").value("COMMON200"))
                .andExpect(jsonPath("$.message").value("평점 삭제에 성공했습니다."))
                .andExpect(jsonPath("$.result").isEmpty());

        verify(ratingService).delete(1L, 4L);
    }

    @Test
    void 평점_등록_수정_삭제는_토큰이_없으면_401() throws Exception {
        mockMvc.perform(post("/ratings").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"movieId\": 680, \"score\": 5}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(patch("/ratings/4").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\": 4}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/ratings/4"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void 예전_경로는_더_이상_없다() throws Exception {
        mockMvc.perform(delete("/members/1/ratings/4").header(HttpHeaders.AUTHORIZATION, bearer(1L)))
                .andExpect(status().isNotFound());
    }
}
