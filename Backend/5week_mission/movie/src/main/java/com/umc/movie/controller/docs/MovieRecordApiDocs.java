package com.umc.movie.controller.docs;

import com.umc.movie.dto.CreateMovieRecordRequest;
import com.umc.movie.dto.MovieRecordResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

@Tag(name = "영화 기록", description = "평점과 즐겨찾기를 한 트랜잭션으로 저장합니다. Authorization: Bearer {token} 헤더가 필요합니다.")
public interface MovieRecordApiDocs {

    String JSON = "application/json";

    String SUCCESS = """
            {
              "isSuccess": true,
              "code": "COMMON201",
              "message": "영화 기록을 저장했습니다.",
              "result": {
                "rating": {"ratingId": 3, "movieId": 238, "score": 5, "comment": "다시 보고 싶은 영화입니다.",
                           "createdAt": "2026-09-06T21:10:00", "updatedAt": "2026-09-06T21:10:00"},
                "favorite": {"favoriteId": 2, "movieId": 238, "createdAt": "2026-09-06T21:10:00"}
              }
            }""";
    String RATING_DUPLICATED = """
            {"isSuccess": false, "code": "RATING4091", "message": "이미 이 영화에 평점을 남기셨습니다.", "result": null}""";
    String FAVORITE_DUPLICATED = """
            {"isSuccess": false, "code": "FAVORITE409_1", "message": "이미 이 영화를 즐겨찾기하셨습니다.", "result": null}""";
    String UNAUTHORIZED = """
            {"isSuccess": false, "code": "AUTH401_2", "message": "로그인이 필요한 요청입니다.", "result": null}""";
    String INVALID_REQUEST = """
            {"isSuccess": false, "code": "COMMON4001", "message": "즐겨찾기 추가 여부를 입력해주세요.", "result": null}""";

    @Operation(summary = "영화 기록 저장",
            description = "addToFavorites가 true면 평점과 즐겨찾기를 함께 저장하고, 둘 중 하나라도 실패하면 모두 rollback합니다. "
                    + "false면 평점만 저장하고 favorite는 null입니다.")
    @ApiResponse(responseCode = "201", description = "저장 성공",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = SUCCESS)))
    @ApiResponse(responseCode = "400", description = "입력값 검증 실패",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = INVALID_REQUEST)))
    @ApiResponse(responseCode = "401", description = "토큰 없음 / 위조 / 만료",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = UNAUTHORIZED)))
    @ApiResponse(responseCode = "409", description = "이미 평점을 남긴 영화(RATING4091) 또는 이미 즐겨찾기한 영화(FAVORITE409_1). 어느 쪽이든 아무것도 저장되지 않습니다.",
            content = @Content(mediaType = JSON, examples = {
                    @ExampleObject(name = "평점 중복", value = RATING_DUPLICATED),
                    @ExampleObject(name = "즐겨찾기 중복", value = FAVORITE_DUPLICATED)
            }))
    ResponseEntity<com.umc.movie.dto.ApiResponse<MovieRecordResponse>> create(
            Long memberId,
            CreateMovieRecordRequest request
    );
}
