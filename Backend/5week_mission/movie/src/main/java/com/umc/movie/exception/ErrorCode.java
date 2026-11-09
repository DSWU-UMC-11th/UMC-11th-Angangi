package com.umc.movie.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import java.util.Arrays;
import java.util.Optional;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

    AUTH_LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "AUTH401_1", "이메일 또는 비밀번호가 올바르지 않습니다.", null),
    AUTH_TOKEN_MISSING(HttpStatus.UNAUTHORIZED, "AUTH401_2", "로그인이 필요한 요청입니다.", null),
    AUTH_TOKEN_INVALID(HttpStatus.UNAUTHORIZED, "AUTH401_3", "유효하지 않은 토큰입니다.", null),
    AUTH_TOKEN_EXPIRED(HttpStatus.UNAUTHORIZED, "AUTH401_4", "토큰이 만료되었습니다. 다시 로그인해주세요.", null),
    MEMBER_NOT_FOUND(HttpStatus.NOT_FOUND, "MEMBER404_1", "해당 회원을 찾을 수 없습니다.", null),
    RATING_NOT_FOUND(HttpStatus.NOT_FOUND, "RATING404_1", "해당 평점을 찾을 수 없습니다.", null),
    RATING_FORBIDDEN(HttpStatus.FORBIDDEN, "RATING403_1", "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.", null),
    FAVORITE_NOT_FOUND(HttpStatus.NOT_FOUND, "FAVORITE404_1", "즐겨찾기한 영화를 찾을 수 없습니다.", null),
    FAVORITE_DUPLICATED(HttpStatus.CONFLICT, "FAVORITE409_1", "이미 이 영화를 즐겨찾기하셨습니다.", "uk_favorite_member_movie"),

    MEMBER_EMAIL_DUPLICATED(HttpStatus.CONFLICT, "MEMBER4091", "이미 사용 중인 이메일입니다.", "email"),
    MEMBER_NICKNAME_DUPLICATED(HttpStatus.CONFLICT, "MEMBER4092", "이미 사용 중인 닉네임입니다.", "nickname"),
    RATING_DUPLICATED(HttpStatus.CONFLICT, "RATING4091", "이미 이 영화에 평점을 남기셨습니다.", "uk_rating_member_movie"),
    DATA_DUPLICATED(HttpStatus.CONFLICT, "COMMON4091", "이미 존재하는 데이터입니다.", null),
    DATA_INTEGRITY_VIOLATED(HttpStatus.CONFLICT, "COMMON4090", "데이터 제약 조건을 위반한 요청입니다.", null);

    private final HttpStatus status;
    private final String code;
    private final String message;
    private final String uniqueKey;

    public static Optional<ErrorCode> fromUniqueKey(String keyName) {
        return Arrays.stream(values())
                .filter(errorCode -> keyName.equals(errorCode.uniqueKey))
                .findFirst();
    }
}
