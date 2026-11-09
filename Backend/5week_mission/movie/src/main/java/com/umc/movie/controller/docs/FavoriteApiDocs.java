package com.umc.movie.controller.docs;

import com.umc.movie.dto.CreateFavoriteRequest;
import com.umc.movie.dto.FavoriteResponse;
import com.umc.movie.dto.FavoriteStatusResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;

@Tag(name = "즐겨찾기", description = "로그인한 회원의 즐겨찾기. 모두 Authorization: Bearer {token} 헤더가 필요합니다.")
public interface FavoriteApiDocs {

    String JSON = "application/json";

    String UNAUTHORIZED = """
            {"isSuccess": false, "code": "AUTH401_2", "message": "로그인이 필요한 요청입니다.", "result": null}""";
    String DUPLICATED = """
            {"isSuccess": false, "code": "FAVORITE409_1", "message": "이미 이 영화를 즐겨찾기하셨습니다.", "result": null}""";
    String NOT_FOUND = """
            {"isSuccess": false, "code": "FAVORITE404_1", "message": "즐겨찾기한 영화를 찾을 수 없습니다.", "result": null}""";
    String INVALID_MOVIE_ID = """
            {"isSuccess": false, "code": "COMMON4001", "message": "영화 ID는 양수여야 합니다.", "result": null}""";

    @Operation(summary = "즐겨찾기 등록", description = "토큰의 회원이 영화를 즐겨찾기합니다. 요청에 memberId를 보내지 않습니다.")
    @ApiResponse(responseCode = "201", description = "등록 성공")
    @ApiResponse(responseCode = "400", description = "movieId가 없거나 양수가 아님",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = INVALID_MOVIE_ID)))
    @ApiResponse(responseCode = "401", description = "토큰 없음(AUTH401_2) / 위조(AUTH401_3) / 만료(AUTH401_4)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = UNAUTHORIZED)))
    @ApiResponse(responseCode = "409", description = "이미 즐겨찾기한 영화",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = DUPLICATED)))
    ResponseEntity<com.umc.movie.dto.ApiResponse<FavoriteResponse>> create(
            Long memberId,
            CreateFavoriteRequest request
    );

    @Operation(summary = "내 즐겨찾기 목록", description = "최신 등록순입니다. 즐겨찾기가 없으면 빈 배열을 200으로 응답합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @ApiResponse(responseCode = "401", description = "토큰 없음 / 위조 / 만료",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = UNAUTHORIZED)))
    ResponseEntity<com.umc.movie.dto.ApiResponse<List<FavoriteResponse>>> getMyFavorites(Long memberId);

    @Operation(summary = "특정 영화 즐겨찾기 여부", description = "즐겨찾기하지 않았어도 오류가 아니라 isFavorite: false를 200으로 응답합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @ApiResponse(responseCode = "401", description = "토큰 없음 / 위조 / 만료",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = UNAUTHORIZED)))
    ResponseEntity<com.umc.movie.dto.ApiResponse<FavoriteStatusResponse>> getStatus(
            Long memberId,
            @Parameter(description = "TMDB 영화 ID", example = "550") Long movieId
    );

    @Operation(summary = "즐겨찾기 해제", description = "공통 응답 형식을 유지하려고 204 대신 200과 result: null을 응답합니다.")
    @ApiResponse(responseCode = "200", description = "해제 성공")
    @ApiResponse(responseCode = "401", description = "토큰 없음 / 위조 / 만료",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = UNAUTHORIZED)))
    @ApiResponse(responseCode = "404", description = "내 즐겨찾기에 없는 영화 (다른 회원의 즐겨찾기도 404)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = NOT_FOUND)))
    ResponseEntity<com.umc.movie.dto.ApiResponse<Void>> delete(
            Long memberId,
            @Parameter(description = "TMDB 영화 ID", example = "550") Long movieId
    );
}
