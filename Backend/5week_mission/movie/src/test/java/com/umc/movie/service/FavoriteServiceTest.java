package com.umc.movie.service;

import com.umc.movie.dto.CreateFavoriteRequest;
import com.umc.movie.dto.FavoriteResponse;
import com.umc.movie.entity.Favorite;
import com.umc.movie.entity.Member;
import com.umc.movie.exception.BusinessException;
import com.umc.movie.exception.ErrorCode;
import com.umc.movie.repository.FavoriteRepository;
import com.umc.movie.repository.MemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class FavoriteServiceTest {

    private static final Long MEMBER_ID = 1L;
    private static final Long MOVIE_ID = 550L;

    private FavoriteRepository favoriteRepository;
    private MemberRepository memberRepository;
    private FavoriteService favoriteService;
    private Member member;

    @BeforeEach
    void setUp() {
        favoriteRepository = mock(FavoriteRepository.class);
        memberRepository = mock(MemberRepository.class);
        favoriteService = new FavoriteService(favoriteRepository, memberRepository);

        member = Member.builder().email("noco@umc.com").password("hash").nickname("수현").build();
        ReflectionTestUtils.setField(member, "memberId", MEMBER_ID);
    }

    private Favorite favorite(Long favoriteId, Long movieId) {
        Favorite favorite = Favorite.builder().member(member).movieId(movieId).build();
        ReflectionTestUtils.setField(favorite, "favoriteId", favoriteId);
        return favorite;
    }

    private static void assertErrorCode(Runnable action, ErrorCode errorCode) {
        assertThatThrownBy(action::run)
                .isInstanceOfSatisfying(BusinessException.class,
                        exception -> assertThat(exception.getErrorCode()).isEqualTo(errorCode));
    }

    @Test
    void 토큰의_회원과_요청의_영화로_즐겨찾기를_저장한다() {
        given(memberRepository.findById(MEMBER_ID)).willReturn(Optional.of(member));
        given(favoriteRepository.save(any(Favorite.class))).willAnswer(invocation -> {
            Favorite saved = invocation.getArgument(0);
            ReflectionTestUtils.setField(saved, "favoriteId", 7L);
            return saved;
        });

        FavoriteResponse response = favoriteService.create(MEMBER_ID, new CreateFavoriteRequest(MOVIE_ID));

        ArgumentCaptor<Favorite> captor = ArgumentCaptor.forClass(Favorite.class);
        verify(favoriteRepository).save(captor.capture());
        assertThat(captor.getValue().getMember()).isSameAs(member);
        assertThat(response.favoriteId()).isEqualTo(7L);
        assertThat(response.movieId()).isEqualTo(MOVIE_ID);
    }

    @Test
    void 이미_즐겨찾기한_영화면_FAVORITE409_1이고_저장하지_않는다() {
        given(memberRepository.findById(MEMBER_ID)).willReturn(Optional.of(member));
        given(favoriteRepository.existsByMember_MemberIdAndMovieId(MEMBER_ID, MOVIE_ID)).willReturn(true);

        assertErrorCode(() -> favoriteService.create(MEMBER_ID, new CreateFavoriteRequest(MOVIE_ID)),
                ErrorCode.FAVORITE_DUPLICATED);
        verify(favoriteRepository, never()).save(any());
    }

    @Test
    void 토큰의_회원이_없으면_MEMBER404_1() {
        given(memberRepository.findById(99L)).willReturn(Optional.empty());

        assertErrorCode(() -> favoriteService.create(99L, new CreateFavoriteRequest(MOVIE_ID)),
                ErrorCode.MEMBER_NOT_FOUND);
    }

    @Test
    void 내_즐겨찾기를_최신_등록순으로_돌려준다() {
        given(favoriteRepository.findByMember_MemberIdOrderByFavoriteIdDesc(MEMBER_ID))
                .willReturn(List.of(favorite(2L, 238L), favorite(1L, 550L)));

        assertThat(favoriteService.getMyFavorites(MEMBER_ID))
                .extracting(FavoriteResponse::movieId)
                .containsExactly(238L, 550L);
    }

    @Test
    void 즐겨찾기가_없으면_빈_목록이다() {
        given(favoriteRepository.findByMember_MemberIdOrderByFavoriteIdDesc(MEMBER_ID)).willReturn(List.of());

        assertThat(favoriteService.getMyFavorites(MEMBER_ID)).isEmpty();
    }

    @Test
    void 즐겨찾기_여부는_없어도_오류가_아니라_false다() {
        given(favoriteRepository.existsByMember_MemberIdAndMovieId(MEMBER_ID, MOVIE_ID)).willReturn(true);

        assertThat(favoriteService.getStatus(MEMBER_ID, MOVIE_ID).isFavorite()).isTrue();
        assertThat(favoriteService.getStatus(MEMBER_ID, 238L).isFavorite()).isFalse();
    }

    @Test
    void 해제하면_내_즐겨찾기를_찾아_삭제한다() {
        Favorite favorite = favorite(1L, MOVIE_ID);
        given(favoriteRepository.findByMember_MemberIdAndMovieId(MEMBER_ID, MOVIE_ID)).willReturn(Optional.of(favorite));

        favoriteService.delete(MEMBER_ID, MOVIE_ID);

        verify(favoriteRepository).delete(favorite);
    }

    @Test
    void 없는_즐겨찾기를_해제하면_FAVORITE404_1() {
        given(favoriteRepository.findByMember_MemberIdAndMovieId(MEMBER_ID, MOVIE_ID)).willReturn(Optional.empty());

        assertErrorCode(() -> favoriteService.delete(MEMBER_ID, MOVIE_ID), ErrorCode.FAVORITE_NOT_FOUND);
        verify(favoriteRepository, never()).delete(any());
    }
}
