package com.umc.movie.service;

import com.umc.movie.dto.CreateFavoriteRequest;
import com.umc.movie.dto.CreateMovieRecordRequest;
import com.umc.movie.dto.MovieRecordResponse;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class MovieRecordTransactionTest {

    private static final long MOVIE_ID = 238L;

    @Autowired
    private MovieRecordService movieRecordService;

    @Autowired
    private NonTransactionalMovieRecorder nonTransactionalMovieRecorder;

    @Autowired
    private FavoriteService favoriteService;

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private RatingRepository ratingRepository;

    @Autowired
    private FavoriteRepository favoriteRepository;

    private Long memberId;

    @TestConfiguration
    static class Config {
        @Bean
        NonTransactionalMovieRecorder nonTransactionalMovieRecorder(
                RatingService ratingService,
                FavoriteService favoriteService
        ) {
            return new NonTransactionalMovieRecorder(ratingService, favoriteService);
        }
    }

    record NonTransactionalMovieRecorder(RatingService ratingService, FavoriteService favoriteService) {
        void create(Long memberId, CreateMovieRecordRequest request) {
            ratingService.create(memberId, request.toRatingRequest());
            favoriteService.create(memberId, request.toFavoriteRequest());
        }
    }

    @BeforeEach
    void setUp() {
        Member member = memberRepository.save(
                Member.builder().email("record@umc.com").password("hash").nickname("기록왕").build());
        memberId = member.getMemberId();
    }

    @AfterEach
    void tearDown() {
        favoriteRepository.deleteAll();
        ratingRepository.deleteAll();
        memberRepository.deleteAll();
    }

    private static CreateMovieRecordRequest request(boolean addToFavorites) {
        return new CreateMovieRecordRequest(MOVIE_ID, 5, "다시 보고 싶은 영화입니다.", addToFavorites);
    }

    private boolean ratingSaved() {
        return ratingRepository.existsByMember_MemberIdAndMovieId(memberId, MOVIE_ID);
    }

    private boolean favoriteSaved() {
        return favoriteRepository.existsByMember_MemberIdAndMovieId(memberId, MOVIE_ID);
    }

    @Test
    void addToFavorites가_true면_평점과_즐겨찾기가_함께_저장된다() {
        MovieRecordResponse response = movieRecordService.create(memberId, request(true));

        assertThat(response.rating().movieId()).isEqualTo(MOVIE_ID);
        assertThat(response.favorite().movieId()).isEqualTo(MOVIE_ID);
        assertThat(ratingSaved()).isTrue();
        assertThat(favoriteSaved()).isTrue();
    }

    @Test
    void addToFavorites가_false면_평점만_저장되고_favorite는_null이다() {
        MovieRecordResponse response = movieRecordService.create(memberId, request(false));

        assertThat(response.favorite()).isNull();
        assertThat(ratingSaved()).isTrue();
        assertThat(favoriteSaved()).isFalse();
    }

    @Test
    void 즐겨찾기_저장이_실패하면_먼저_저장한_평점도_rollback된다() {
        favoriteService.create(memberId, new CreateFavoriteRequest(MOVIE_ID));

        assertThatThrownBy(() -> movieRecordService.create(memberId, request(true)))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.FAVORITE_DUPLICATED));

        assertThat(ratingSaved()).isFalse();
    }

    @Test
    void 트랜잭션으로_묶지_않으면_실패해도_평점만_남는다() {
        favoriteService.create(memberId, new CreateFavoriteRequest(MOVIE_ID));

        assertThatThrownBy(() -> nonTransactionalMovieRecorder.create(memberId, request(true)))
                .isInstanceOf(BusinessException.class);

        assertThat(ratingSaved()).isTrue();
    }

    @Test
    void 이미_평점이_있으면_RATING4091이고_즐겨찾기도_저장되지_않는다() {
        movieRecordService.create(memberId, request(false));

        assertThatThrownBy(() -> movieRecordService.create(memberId, request(true)))
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(ErrorCode.RATING_DUPLICATED));

        assertThat(favoriteSaved()).isFalse();
        assertThat(ratingRepository.count()).isEqualTo(1);
    }
}
