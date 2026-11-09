package com.umc.movie.service;

import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.RatingResponse;
import com.umc.movie.dto.UpdateRatingRequest;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class RatingServiceTest {

    private static final Long OWNER_ID = 1L;
    private static final Long OTHER_ID = 2L;
    private static final Long RATING_ID = 10L;

    private RatingRepository ratingRepository;
    private MemberRepository memberRepository;
    private RatingService ratingService;
    private Member owner;

    @BeforeEach
    void setUp() {
        ratingRepository = mock(RatingRepository.class);
        memberRepository = mock(MemberRepository.class);
        ratingService = new RatingService(ratingRepository, memberRepository);

        owner = Member.builder().email("noco@umc.com").password("hash").nickname("수현").build();
        ReflectionTestUtils.setField(owner, "memberId", OWNER_ID);
    }

    private Rating ownersRating() {
        Rating rating = Rating.builder().member(owner).movieId(550L).score(3).comment("보통").build();
        ReflectionTestUtils.setField(rating, "ratingId", RATING_ID);
        return rating;
    }

    private static void assertErrorCode(Runnable action, ErrorCode errorCode) {
        assertThatThrownBy(action::run)
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(errorCode));
    }

    @Test
    void 평점을_등록하면_저장된_평점을_돌려준다() {
        given(memberRepository.findById(OWNER_ID)).willReturn(Optional.of(owner));
        given(ratingRepository.save(any(Rating.class))).willAnswer(invocation -> {
            Rating saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "ratingId", RATING_ID);
            return saved;
        });

        RatingResponse response = ratingService.create(OWNER_ID, new CreateRatingRequest(550L, 5, "최고"));

        assertThat(response.ratingId()).isEqualTo(RATING_ID);
        assertThat(response.movieId()).isEqualTo(550L);
        assertThat(response.score()).isEqualTo(5);
    }

    @Test
    void 토큰의_회원이_없으면_MEMBER404_1() {
        given(memberRepository.findById(999L)).willReturn(Optional.empty());

        assertErrorCode(() -> ratingService.create(999L, new CreateRatingRequest(550L, 5, null)),
                ErrorCode.MEMBER_NOT_FOUND);
    }

    @Test
    void 공개_목록_조회도_없는_회원이면_MEMBER404_1() {
        given(memberRepository.existsById(999L)).willReturn(false);

        assertErrorCode(() -> ratingService.getRatingsByMember(999L, 0, 10), ErrorCode.MEMBER_NOT_FOUND);
    }

    @Test
    void 같은_영화에_이미_평점이_있으면_저장하지_않는다() {
        given(memberRepository.findById(OWNER_ID)).willReturn(Optional.of(owner));
        given(ratingRepository.existsByMember_MemberIdAndMovieId(OWNER_ID, 550L)).willReturn(true);

        assertErrorCode(() -> ratingService.create(OWNER_ID, new CreateRatingRequest(550L, 5, null)),
                ErrorCode.RATING_DUPLICATED);
        verify(ratingRepository, never()).save(any());
    }

    @Test
    void 본인_평점을_수정하면_flush한_뒤_바뀐_값을_돌려준다() {
        Rating rating = ownersRating();
        given(ratingRepository.findById(RATING_ID)).willReturn(Optional.of(rating));

        RatingResponse response = ratingService.update(OWNER_ID, RATING_ID, new UpdateRatingRequest(5, "다시 보니 명작"));

        assertThat(rating.getScore()).isEqualTo(5);
        assertThat(response.comment()).isEqualTo("다시 보니 명작");
        verify(ratingRepository, never()).save(any());
        verify(ratingRepository).flush();
    }

    @Test
    void 다른_회원의_평점을_수정하거나_삭제하면_RATING403_1() {
        given(ratingRepository.findById(RATING_ID)).willReturn(Optional.of(ownersRating()));

        assertErrorCode(() -> ratingService.update(OTHER_ID, RATING_ID, new UpdateRatingRequest(1, null)),
                ErrorCode.RATING_FORBIDDEN);
        assertErrorCode(() -> ratingService.delete(OTHER_ID, RATING_ID), ErrorCode.RATING_FORBIDDEN);
        verify(ratingRepository, never()).delete(any());
    }

    @Test
    void 없는_평점은_주인을_따지기_전에_RATING404_1() {
        given(ratingRepository.findById(999L)).willReturn(Optional.empty());

        // 남의 회원 번호로 요청해도 403이 아니라 404예요. 없는 것에 "권한 없음"이라고 답하지 않아요
        assertErrorCode(() -> ratingService.update(OTHER_ID, 999L, new UpdateRatingRequest(1, null)),
                ErrorCode.RATING_NOT_FOUND);
        assertErrorCode(() -> ratingService.delete(OWNER_ID, 999L), ErrorCode.RATING_NOT_FOUND);
    }

    @Test
    void 본인_평점을_삭제하면_찾은_뒤_삭제한다() {
        Rating rating = ownersRating();
        given(ratingRepository.findById(RATING_ID)).willReturn(Optional.of(rating));

        ratingService.delete(OWNER_ID, RATING_ID);

        var order = inOrder(ratingRepository);
        order.verify(ratingRepository).findById(RATING_ID);
        order.verify(ratingRepository).delete(rating);
    }
}
