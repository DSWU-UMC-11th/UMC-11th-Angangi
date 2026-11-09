package com.umc.movie.controller;

import com.umc.movie.dto.RatingPageResponse;
import com.umc.movie.dto.RatingResponse;
import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.service.RatingService;
import com.umc.movie.util.JwtUtil;
import org.springframework.context.annotation.Import;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(JwtUtil.class)
@WebMvcTest(RatingController.class)
class RatingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RatingService ratingService;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 11, 9, 12, 0);

    @Test
    void page와_size를_생략하면_0페이지_10개를_조회한다() throws Exception {
        RatingResponse rating = new RatingResponse(2L, 155L, 4, "다시 봐도 명작", NOW, NOW);
        given(ratingService.getRatingsByMember(1L, 0, 10))
                .willReturn(new RatingPageResponse(List.of(rating), 0, 10, 1, 1, false));

        mockMvc.perform(get("/members/{memberId}/ratings", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ratings[0].ratingId").value(2))
                .andExpect(jsonPath("$.ratings[0].movieId").value(155))
                .andExpect(jsonPath("$.page").value(0))
                .andExpect(jsonPath("$.size").value(10))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.hasNext").value(false));
    }

    @Test
    void 쿼리_파라미터로_받은_page와_size를_서비스에_전달한다() throws Exception {
        given(ratingService.getRatingsByMember(1L, 1, 1))
                .willReturn(new RatingPageResponse(List.of(), 1, 1, 2, 2, false));

        mockMvc.perform(get("/members/{memberId}/ratings", 1)
                        .param("page", "1")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.page").value(1))
                .andExpect(jsonPath("$.totalPages").value(2));

        verify(ratingService).getRatingsByMember(1L, 1, 1);
    }

    @Test
    void page가_음수이거나_size가_범위를_벗어나면_400을_응답한다() throws Exception {
        mockMvc.perform(get("/members/{memberId}/ratings", 1).param("page", "-1"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/members/{memberId}/ratings", 1).param("size", "0"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(get("/members/{memberId}/ratings", 1).param("size", "51"))
                .andExpect(status().isBadRequest());

        verify(ratingService, never()).getRatingsByMember(anyLong(), anyInt(), anyInt());
    }

    @Test
    void 존재하지_않는_회원이면_404를_응답한다() throws Exception {
        given(ratingService.getRatingsByMember(999L, 0, 10))
                .willThrow(new BusinessException(ErrorCode.MEMBER_NOT_FOUND));

        mockMvc.perform(get("/members/{memberId}/ratings", 999))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("MEMBER404_1"));
    }
}
