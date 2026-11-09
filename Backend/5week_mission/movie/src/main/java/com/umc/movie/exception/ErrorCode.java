package com.umc.movie.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

import java.util.Arrays;
import java.util.Optional;

@Getter
@RequiredArgsConstructor
public enum ErrorCode {

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
