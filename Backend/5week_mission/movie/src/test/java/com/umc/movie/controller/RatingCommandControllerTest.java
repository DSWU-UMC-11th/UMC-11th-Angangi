package com.umc.movie.controller;

import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.UpdateRatingRequest;
import com.umc.movie.service.RatingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RatingController.class)
class RatingCommandControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RatingService ratingService;

    @Test
    void 평점을_등록하면_201과_평점_ID를_응답한다() throws Exception {
        given(ratingService.create(eq(1L), any(CreateRatingRequest.class))).willReturn(4L);

        mockMvc.perform(post("/members/1/ratings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"movieId": 680, "score": 5, "comment": "대사가 기억에 남아요"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.isSuccess").value(true))
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.message").value("평점 등록에 성공했습니다."))
                .andExpect(jsonPath("$.result").value(4));
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
        mockMvc.perform(post("/members/1/ratings").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("COMMON4001"))
                .andExpect(jsonPath("$.message").value(message));

        verify(ratingService, never()).create(anyLong(), any());
    }

    @Test
    void 후기가_500자를_넘으면_400() throws Exception {
        String longComment = "가".repeat(501);

        mockMvc.perform(patch("/members/1/ratings/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\": 4, \"comment\": \"" + longComment + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("후기는 500자 이하로 입력해주세요."));
    }

    @Test
    void 평점을_수정하면_200과_성공_응답을_돌려준다() throws Exception {
        mockMvc.perform(patch("/members/1/ratings/4")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"score\": 4, \"comment\": \"다시 보니 괜찮아요\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("COMMON200"))
                .andExpect(jsonPath("$.message").value("평점 수정에 성공했습니다."));

        verify(ratingService).update(eq(4L), eq(1L), any(UpdateRatingRequest.class));
    }

    @Test
    void 평점을_삭제하면_본문_없이_204를_응답한다() throws Exception {
        mockMvc.perform(delete("/members/1/ratings/4"))
                .andExpect(status().isNoContent())
                .andExpect(content().string(""));

        verify(ratingService).delete(4L, 1L);
    }

    @Test
    void 다른_회원의_평점을_삭제하려_하면_403을_공통_형식으로_응답한다() throws Exception {
        willThrow(new ResponseStatusException(HttpStatus.FORBIDDEN, "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다."))
                .given(ratingService).delete(4L, 2L);

        mockMvc.perform(delete("/members/2/ratings/4"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.isSuccess").value(false))
                .andExpect(jsonPath("$.code").value("COMMON403"))
                .andExpect(jsonPath("$.message").value("본인이 작성한 평점만 수정하거나 삭제할 수 있습니다."));
    }
}
