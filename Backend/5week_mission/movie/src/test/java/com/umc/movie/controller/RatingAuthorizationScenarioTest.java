package com.umc.movie.controller;

import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.service.RatingService;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import({JwtUtil.class, RatingService.class})
@WebMvcTest(RatingController.class)
class RatingAuthorizationScenarioTest {

    private static final long MEMBER_A = 1L;
    private static final long MEMBER_B = 2L;
    private static final long RATING_OF_A = 4L;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @MockitoBean
    private RatingRepository ratingRepository;

    @MockitoBean
    private MemberRepository memberRepository;

    @BeforeEach
    void setUp() {
        Member memberA = Member.builder().email("a@umc.com").password("hash").nickname("에이").build();
        ReflectionTestUtils.setField(memberA, "memberId", MEMBER_A);
        Rating ratingOfA = Rating.builder().member(memberA).movieId(680L).score(3).comment("보통").build();
        ReflectionTestUtils.setField(ratingOfA, "ratingId", RATING_OF_A);

        given(ratingRepository.findById(RATING_OF_A)).willReturn(Optional.of(ratingOfA));
        given(ratingRepository.findById(99999L)).willReturn(Optional.empty());
    }

    private String tokenOf(long memberId) {
        return "Bearer " + jwtUtil.createAccessToken(memberId, "member" + memberId + "@umc.com");
    }

    private ResultActions updateRatingOfA(String authorization) throws Exception {
        var request = patch("/ratings/{ratingId}", RATING_OF_A)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"score\": 1, \"comment\": \"남이 바꾼 후기\"}");
        if (authorization != null) {
            request.header(HttpHeaders.AUTHORIZATION, authorization);
        }
        return mockMvc.perform(request);
    }

    @Test
    void A가_자기_평점을_수정하면_200() throws Exception {
        updateRatingOfA(tokenOf(MEMBER_A))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.score").value(1));
    }

    @Test
    void 토큰은_멀쩡해도_B가_A의_평점을_수정하면_403() throws Exception {
        updateRatingOfA(tokenOf(MEMBER_B))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("RATING403_1"))
                .andExpect(jsonPath("$.message").value("본인이 작성한 평점만 수정하거나 삭제할 수 있습니다."));
    }

    @Test
    void 토큰이_없으면_평점을_찾아보기도_전에_401() throws Exception {
        updateRatingOfA(null)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));

        verify(ratingRepository, never()).findById(any());
    }

    @Test
    void 없는_평점을_삭제하면_404() throws Exception {
        mockMvc.perform(delete("/ratings/99999").header(HttpHeaders.AUTHORIZATION, tokenOf(MEMBER_A)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("RATING404_1"));
    }

    @Test
    void B가_A의_평점을_삭제하려_하면_403이고_삭제되지_않는다() throws Exception {
        mockMvc.perform(delete("/ratings/{ratingId}", RATING_OF_A).header(HttpHeaders.AUTHORIZATION, tokenOf(MEMBER_B)))
                .andExpect(status().isForbidden());

        verify(ratingRepository, never()).delete(any());
    }
}
