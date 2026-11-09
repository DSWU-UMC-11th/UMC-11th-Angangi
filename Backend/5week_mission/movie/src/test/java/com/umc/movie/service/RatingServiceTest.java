package com.umc.movie.service;

import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.UpdateRatingRequest;
import com.umc.movie.entity.Member;
import com.umc.movie.entity.Rating;
import com.umc.movie.repository.MemberRepository;
import com.umc.movie.repository.RatingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
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

    private static void assertStatus(Runnable action, HttpStatus status, String reason) {
        assertThatThrownBy(action::run)
                .isInstanceOfSatisfying(ResponseStatusException.class, exception -> {
                    assertThat(exception.getStatusCode()).isEqualTo(status);
                    assertThat(exception.getReason()).isEqualTo(reason);
                });
    }

    @Test
    void 평점을_등록하면_저장된_평점_ID를_돌려준다() {
        given(memberRepository.findById(OWNER_ID)).willReturn(Optional.of(owner));
        given(ratingRepository.save(any(Rating.class))).willAnswer(invocation -> {
            Rating saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "ratingId", RATING_ID);
            return saved;
        });

        Long ratingId = ratingService.create(OWNER_ID, new CreateRatingRequest(550L, 5, "최고"));

        assertThat(ratingId).isEqualTo(RATING_ID);
    }

    @Test
    void 존재하지_않는_회원이면_404() {
        given(memberRepository.findById(999L)).willReturn(Optional.empty());

        assertStatus(() -> ratingService.create(999L, new CreateRatingRequest(550L, 5, null)),
                HttpStatus.NOT_FOUND, "존재하지 않는 유저입니다.");
    }

    @Test
    void 같은_영화에_이미_평점이_있으면_저장하지_않는다() {
        given(memberRepository.findById(OWNER_ID)).willReturn(Optional.of(owner));
        given(ratingRepository.existsByMember_MemberIdAndMovieId(OWNER_ID, 550L)).willReturn(true);

        assertThatThrownBy(() -> ratingService.create(OWNER_ID, new CreateRatingRequest(550L, 5, null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("이미 이 영화에 평점을 남기셨습니다.");
        verify(ratingRepository, never()).save(any());
    }

    @Test
    void 본인_평점을_수정하면_엔티티의_필드가_바뀐다() {
        Rating rating = ownersRating();
        given(ratingRepository.findById(RATING_ID)).willReturn(Optional.of(rating));

        ratingService.update(RATING_ID, OWNER_ID, new UpdateRatingRequest(5, "다시 보니 명작"));

        assertThat(rating.getScore()).isEqualTo(5);
        assertThat(rating.getComment()).isEqualTo("다시 보니 명작");
        verify(ratingRepository, never()).save(any());
    }

    @Test
    void 다른_회원의_평점을_수정하거나_삭제하면_403() {
        given(ratingRepository.findById(RATING_ID)).willReturn(Optional.of(ownersRating()));
        String reason = "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.";

        assertStatus(() -> ratingService.update(RATING_ID, OTHER_ID, new UpdateRatingRequest(1, null)),
                HttpStatus.FORBIDDEN, reason);
        assertStatus(() -> ratingService.delete(RATING_ID, OTHER_ID), HttpStatus.FORBIDDEN, reason);
        verify(ratingRepository, never()).delete(any());
    }

    @Test
    void 존재하지_않는_평점을_수정하거나_삭제하면_404() {
        given(ratingRepository.findById(999L)).willReturn(Optional.empty());

        assertStatus(() -> ratingService.update(999L, OWNER_ID, new UpdateRatingRequest(1, null)),
                HttpStatus.NOT_FOUND, "존재하지 않는 평점입니다.");
        assertStatus(() -> ratingService.delete(999L, OWNER_ID), HttpStatus.NOT_FOUND, "존재하지 않는 평점입니다.");
    }

    @Test
    void 본인_평점을_삭제하면_삭제를_요청한다() {
        Rating rating = ownersRating();
        given(ratingRepository.findById(RATING_ID)).willReturn(Optional.of(rating));

        ratingService.delete(RATING_ID, OWNER_ID);

        verify(ratingRepository).delete(rating);
    }
}
