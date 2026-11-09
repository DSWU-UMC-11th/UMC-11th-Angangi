package com.umc.movie.controller;

import com.umc.movie.entity.Favorite;
import com.umc.movie.entity.Member;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MovieRecordApiTest {

    private static final String RECORD_WITH_FAVORITE = """
            {"movieId": 550, "score": 5, "comment": "인생 영화입니다.", "addToFavorites": true}""";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    @Autowired
    private JwtUtil jwtUtil;

    private Member member;
    private String authorizationHeader;

    @BeforeEach
    void setUp() {
        member = memberRepository.save(Member.builder()
                .email("challenger@umc.com")
                .password("$2a$10$abcdefghijklmnopqrstuv")
                .nickname("영화조아")
                .build());

        authorizationHeader = "Bearer " + jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());
    }

    @AfterEach
    void tearDown() {
        favoriteRepository.deleteAll();
        ratingRepository.deleteAll();
        memberRepository.deleteAll();
    }

    @Test
    @DisplayName("이미 즐겨찾기한 영화를 addToFavorites true로 기록하면 409 FAVORITE409_1이고, 먼저 저장하려던 평점도 남지 않는다")
    void movieRecordRollsBackRatingWhenFavoriteFails() throws Exception {
        favoriteRepository.save(Favorite.builder().member(member).movieId(550L).build());
        long ratingCountBefore = ratingRepository.count();

        mockMvc.perform(post("/movie-records")
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(RECORD_WITH_FAVORITE))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("FAVORITE409_1"));

        assertThat(ratingRepository.count()).isEqualTo(ratingCountBefore);
        assertThat(ratingRepository.existsByMember_MemberIdAndMovieId(member.getMemberId(), 550L)).isFalse();
    }

    @Test
    @DisplayName("즐겨찾기하지 않은 영화를 기록하면 201이고 평점과 즐겨찾기가 함께 저장된다")
    void movieRecordSavesRatingAndFavoriteTogether() throws Exception {
        mockMvc.perform(post("/movie-records")
                        .header(HttpHeaders.AUTHORIZATION, authorizationHeader)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(RECORD_WITH_FAVORITE))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.result.rating.movieId").value(550))
                .andExpect(jsonPath("$.result.favorite.movieId").value(550));

        assertThat(ratingRepository.count()).isEqualTo(1);
        assertThat(favoriteRepository.count()).isEqualTo(1);
    }
}
