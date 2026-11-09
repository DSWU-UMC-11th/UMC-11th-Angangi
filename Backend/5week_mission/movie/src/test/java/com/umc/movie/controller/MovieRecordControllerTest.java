package com.umc.movie.controller;

import com.umc.movie.dto.CreateMovieRecordRequest;
import com.umc.movie.dto.FavoriteResponse;
import com.umc.movie.dto.MovieRecordResponse;
import com.umc.movie.dto.RatingResponse;
import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.service.MovieRecordService;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(JwtUtil.class)
@WebMvcTest(MovieRecordController.class)
class MovieRecordControllerTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 9, 6, 21, 10);
    private static final RatingResponse RATING = new RatingResponse(3L, 238L, 5, "다시 보고 싶은 영화입니다.", NOW, NOW);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @MockitoBean
    private MovieRecordService movieRecordService;

    private ResultActions record(String body) throws Exception {
        return mockMvc.perform(post("/movie-records")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + jwtUtil.createAccessToken(1L, "noco@umc.com"))
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    @Test
    void 평점과_즐겨찾기를_함께_저장하면_201과_둘_다_응답한다() throws Exception {
        given(movieRecordService.create(eq(1L), any(CreateMovieRecordRequest.class)))
                .willReturn(new MovieRecordResponse(RATING, new FavoriteResponse(2L, 238L, NOW)));

        record("""
                {"movieId": 238, "score": 5, "comment": "다시 보고 싶은 영화입니다.", "addToFavorites": true}
                """)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.message").value("영화 기록을 저장했습니다."))
                .andExpect(jsonPath("$.result.rating.ratingId").value(3))
                .andExpect(jsonPath("$.result.favorite.favoriteId").value(2));
    }

    @Test
    void 즐겨찾기를_추가하지_않으면_favorite는_null() throws Exception {
        given(movieRecordService.create(eq(1L), any(CreateMovieRecordRequest.class)))
                .willReturn(new MovieRecordResponse(RATING, null));

        record("""
                {"movieId": 238, "score": 5, "addToFavorites": false}
                """)
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.result.rating.movieId").value(238))
                .andExpect(jsonPath("$.result.favorite").isEmpty());
    }

    @Test
    void addToFavorites를_빼면_400() throws Exception {
        record("""
                {"movieId": 238, "score": 5}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("즐겨찾기 추가 여부를 입력해주세요."));

        verify(movieRecordService, never()).create(anyLong(), any());
    }

    @Test
    void 이미_즐겨찾기한_영화면_409와_FAVORITE409_1() throws Exception {
        given(movieRecordService.create(eq(1L), any(CreateMovieRecordRequest.class)))
                .willThrow(new BusinessException(ErrorCode.FAVORITE_DUPLICATED));

        record("""
                {"movieId": 238, "score": 5, "addToFavorites": true}
                """)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("FAVORITE409_1"));
    }

    @Test
    void 토큰_없이_부르면_401() throws Exception {
        mockMvc.perform(post("/movie-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"movieId\": 238, \"score\": 5, \"addToFavorites\": true}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));
    }
}
