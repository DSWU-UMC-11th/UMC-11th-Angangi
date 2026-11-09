package com.umc.movie.controller;

import com.umc.movie.dto.CreateFavoriteRequest;
import com.umc.movie.dto.FavoriteResponse;
import com.umc.movie.dto.FavoriteStatusResponse;
import com.umc.movie.service.FavoriteService;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(JwtUtil.class)
@WebMvcTest(FavoriteController.class)
class FavoriteControllerTest {

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 9, 6, 21, 0);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @MockitoBean
    private FavoriteService favoriteService;

    private String bearer(Long memberId) {
        return "Bearer " + jwtUtil.createAccessToken(memberId, "member" + memberId + "@umc.com");
    }

    @Test
    void 즐겨찾기를_등록하면_201과_등록한_즐겨찾기를_응답한다() throws Exception {
        given(favoriteService.create(eq(1L), any(CreateFavoriteRequest.class)))
                .willReturn(new FavoriteResponse(1L, 550L, NOW));

        mockMvc.perform(post("/favorites")
                        .header(HttpHeaders.AUTHORIZATION, bearer(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"movieId\": 550}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.code").value("COMMON201"))
                .andExpect(jsonPath("$.message").value("즐겨찾기를 등록했습니다."))
                .andExpect(jsonPath("$.result.favoriteId").value(1))
                .andExpect(jsonPath("$.result.movieId").value(550))
                .andExpect(jsonPath("$.result.createdAt").value("2026-09-06T21:00:00"));
    }

    @Test
    void 바디의_memberId는_무시하고_토큰의_회원으로_등록한다() throws Exception {
        mockMvc.perform(post("/favorites")
                        .header(HttpHeaders.AUTHORIZATION, bearer(1L))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"memberId\": 2, \"movieId\": 550}"))
                .andExpect(status().isCreated());

        verify(favoriteService).create(eq(1L), any(CreateFavoriteRequest.class));
    }

    @Test
    void 내_즐겨찾기_목록을_배열로_응답한다() throws Exception {
        given(favoriteService.getMyFavorites(1L))
                .willReturn(List.of(new FavoriteResponse(2L, 238L, NOW), new FavoriteResponse(1L, 550L, NOW)));

        mockMvc.perform(get("/favorites").header(HttpHeaders.AUTHORIZATION, bearer(1L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("내 즐겨찾기 목록을 조회했습니다."))
                .andExpect(jsonPath("$.result.length()").value(2))
                .andExpect(jsonPath("$.result[0].movieId").value(238));
    }

    @Test
    void 즐겨찾기_여부를_isFavorite로_응답한다() throws Exception {
        given(favoriteService.getStatus(1L, 550L)).willReturn(new FavoriteStatusResponse(true));

        mockMvc.perform(get("/favorites/550").header(HttpHeaders.AUTHORIZATION, bearer(1L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("즐겨찾기 여부를 조회했습니다."))
                .andExpect(jsonPath("$.result.isFavorite").value(true));
    }

    @Test
    void 즐겨찾기를_해제하면_200과_result_null() throws Exception {
        mockMvc.perform(delete("/favorites/550").header(HttpHeaders.AUTHORIZATION, bearer(1L)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("COMMON200"))
                .andExpect(jsonPath("$.message").value("즐겨찾기를 해제했습니다."))
                .andExpect(jsonPath("$.result").isEmpty());

        verify(favoriteService).delete(1L, 550L);
    }
}
