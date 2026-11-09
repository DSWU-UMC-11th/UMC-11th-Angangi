package com.umc.movie.controller;

import com.umc.movie.entity.Member;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.util.JwtUtil;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class FavoriteScenarioTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    private String tokenA;
    private String tokenB;

    @BeforeEach
    void setUp() {
        tokenA = tokenOf(memberRepository.save(member("a@umc.com", "에이")));
        tokenB = tokenOf(memberRepository.save(member("b@umc.com", "비이")));
    }

    @AfterEach
    void tearDown() {
        favoriteRepository.deleteAll();
        memberRepository.deleteAll();
    }

    private static Member member(String email, String nickname) {
        return Member.builder().email(email).password("hash").nickname(nickname).build();
    }

    private String tokenOf(Member member) {
        return "Bearer " + jwtUtil.createAccessToken(member.getMemberId(), member.getEmail());
    }

    private ResultActions addFavorite(String token, String body) throws Exception {
        return mockMvc.perform(post("/favorites")
                .header(HttpHeaders.AUTHORIZATION, token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body));
    }

    private ResultActions getFavorites(String token) throws Exception {
        return mockMvc.perform(get("/favorites").header(HttpHeaders.AUTHORIZATION, token));
    }

    private ResultActions getStatus(String token, long movieId) throws Exception {
        return mockMvc.perform(get("/favorites/{movieId}", movieId).header(HttpHeaders.AUTHORIZATION, token));
    }

    private ResultActions removeFavorite(String token, long movieId) throws Exception {
        return mockMvc.perform(delete("/favorites/{movieId}", movieId).header(HttpHeaders.AUTHORIZATION, token));
    }

    @Test
    void 등록부터_해제까지_워크북의_Postman_순서대로_동작한다() throws Exception {
        addFavorite(tokenA, "{\"movieId\": 550}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.result.movieId").value(550));

        addFavorite(tokenA, "{\"movieId\": 550}")
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("FAVORITE409_1"));

        getFavorites(tokenA)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.length()").value(1))
                .andExpect(jsonPath("$.result[0].movieId").value(550));

        getStatus(tokenA, 550).andExpect(jsonPath("$.result.isFavorite").value(true));

        removeFavorite(tokenA, 550)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value("COMMON200"))
                .andExpect(jsonPath("$.result").isEmpty());

        getStatus(tokenA, 550).andExpect(jsonPath("$.result.isFavorite").value(false));

        getFavorites(tokenA)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result").isEmpty());
    }

    @Test
    void 목록은_최신_등록순이다() throws Exception {
        addFavorite(tokenA, "{\"movieId\": 550}");
        addFavorite(tokenA, "{\"movieId\": 238}");

        getFavorites(tokenA)
                .andExpect(jsonPath("$.result[0].movieId").value(238))
                .andExpect(jsonPath("$.result[1].movieId").value(550));
    }

    @Test
    void 토큰_없이_등록하면_401_AUTH401_2() throws Exception {
        mockMvc.perform(post("/favorites")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"movieId\": 550}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("AUTH401_2"));
    }

    @Test
    void 즐겨찾기하지_않은_영화의_여부는_200_false() throws Exception {
        getStatus(tokenA, 680)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result.isFavorite").value(false));
    }

    @Test
    void 없는_즐겨찾기를_해제하면_404_FAVORITE404_1() throws Exception {
        removeFavorite(tokenA, 680)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("FAVORITE404_1"))
                .andExpect(jsonPath("$.message").value("즐겨찾기한 영화를 찾을 수 없습니다."));
    }

    @Test
    void movieId가_0이면_400() throws Exception {
        addFavorite(tokenA, "{\"movieId\": 0}")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("COMMON4001"))
                .andExpect(jsonPath("$.message").value("영화 ID는 양수여야 합니다."));
    }

    @Test
    void 빈_목록은_오류가_아니라_200과_빈_배열() throws Exception {
        getFavorites(tokenA)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.result").isArray())
                .andExpect(jsonPath("$.result").isEmpty());
    }

    @Test
    void 다른_회원의_즐겨찾기는_보이지도_해제되지도_않는다() throws Exception {
        addFavorite(tokenA, "{\"movieId\": 550}");

        getFavorites(tokenB).andExpect(jsonPath("$.result").isEmpty());
        getStatus(tokenB, 550).andExpect(jsonPath("$.result.isFavorite").value(false));
        removeFavorite(tokenB, 550)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("FAVORITE404_1"));

        getStatus(tokenA, 550).andExpect(jsonPath("$.result.isFavorite").value(true));
    }

    @Test
    void 같은_영화라도_회원이_다르면_각자_즐겨찾기할_수_있다() throws Exception {
        addFavorite(tokenA, "{\"movieId\": 550}").andExpect(status().isCreated());
        addFavorite(tokenB, "{\"movieId\": 550}").andExpect(status().isCreated());
    }
}
