package com.umc.movie.controller.docs;

public final class ApiExamples {

    public static final String JSON = "application/json";

    public static final String VALIDATION_FAILED = """
            {"isSuccess": false, "code": "COMMON4001", "message": "별점은 5점 이하여야 합니다.", "result": null}""";
    public static final String LOGIN_FAILED = """
            {"isSuccess": false, "code": "AUTH401_1", "message": "이메일 또는 비밀번호가 올바르지 않습니다.", "result": null}""";
    public static final String UNAUTHORIZED = """
            {"isSuccess": false, "code": "AUTH401_2", "message": "로그인이 필요한 요청입니다.", "result": null}""";
    public static final String MEMBER_NOT_FOUND = """
            {"isSuccess": false, "code": "MEMBER404_1", "message": "해당 회원을 찾을 수 없습니다.", "result": null}""";
    public static final String EMAIL_DUPLICATED = """
            {"isSuccess": false, "code": "MEMBER4091", "message": "이미 사용 중인 이메일입니다.", "result": null}""";
    public static final String NICKNAME_DUPLICATED = """
            {"isSuccess": false, "code": "MEMBER4092", "message": "이미 사용 중인 닉네임입니다.", "result": null}""";
    public static final String RATING_DUPLICATED = """
            {"isSuccess": false, "code": "RATING4091", "message": "이미 이 영화에 평점을 남기셨습니다.", "result": null}""";
    public static final String RATING_FORBIDDEN = """
            {"isSuccess": false, "code": "RATING403_1", "message": "본인이 작성한 평점만 수정하거나 삭제할 수 있습니다.", "result": null}""";
    public static final String RATING_NOT_FOUND = """
            {"isSuccess": false, "code": "RATING404_1", "message": "해당 평점을 찾을 수 없습니다.", "result": null}""";

    private ApiExamples() {
    }
}
