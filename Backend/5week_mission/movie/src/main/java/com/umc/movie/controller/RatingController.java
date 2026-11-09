package com.umc.movie.controller;

import com.umc.movie.auth.LoginMember;
import com.umc.movie.dto.ApiResponse;
import com.umc.movie.dto.CreateRatingRequest;
import com.umc.movie.dto.RatingPageResponse;
import com.umc.movie.dto.RatingResponse;
import com.umc.movie.dto.UpdateRatingRequest;
import com.umc.movie.service.RatingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.umc.movie.controller.docs.ApiExamples.JSON;
import static com.umc.movie.controller.docs.ApiExamples.MEMBER_NOT_FOUND;
import static com.umc.movie.controller.docs.ApiExamples.RATING_DUPLICATED;
import static com.umc.movie.controller.docs.ApiExamples.RATING_FORBIDDEN;
import static com.umc.movie.controller.docs.ApiExamples.RATING_NOT_FOUND;
import static com.umc.movie.controller.docs.ApiExamples.UNAUTHORIZED;
import static com.umc.movie.controller.docs.ApiExamples.VALIDATION_FAILED;

@Tag(name = "평점", description = "평점 등록·수정·삭제는 토큰이 필요하고, 회원별 목록 조회는 공개입니다.")
@RestController
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @Operation(summary = "회원별 평점 목록", description = "토큰 없이 호출하는 공개 API입니다. 최신순으로 page, size만큼 돌려줍니다.")
    @SecurityRequirements
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "page가 음수이거나 size가 1~50이 아님 (COMMON4001)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = VALIDATION_FAILED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "없는 회원 (MEMBER404_1)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = MEMBER_NOT_FOUND)))
    @GetMapping("/members/{memberId}/ratings")
    public RatingPageResponse getMemberRatings(
            @Parameter(description = "평점을 볼 회원 ID", example = "1") @PathVariable Long memberId,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "page는 0 이상이어야 합니다.")
            int page,
            @RequestParam(defaultValue = "10")
            @Min(value = 1, message = "size는 1 이상이어야 합니다.")
            @Max(value = 50, message = "size는 50 이하여야 합니다.")
            int size
    ) {
        return ratingService.getRatingsByMember(memberId, page, size);
    }

    @Operation(summary = "평점 등록", description = "토큰이 필요합니다. 토큰의 회원으로 등록하며, 요청에 memberId를 보내지 않습니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "등록 성공")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "별점이 1~5가 아니거나 후기가 500자 초과 (COMMON4001)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = VALIDATION_FAILED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "토큰 없음(AUTH401_2) / 위조(AUTH401_3) / 만료(AUTH401_4)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = UNAUTHORIZED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "같은 영화에 이미 평점을 남김 (RATING4091)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = RATING_DUPLICATED)))
    @PostMapping("/ratings")
    public ResponseEntity<ApiResponse<RatingResponse>> create(
            @LoginMember Long memberId,
            @Valid @RequestBody CreateRatingRequest request
    ) {
        RatingResponse response = ratingService.create(memberId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("평점 등록에 성공했습니다.", response));
    }

    @Operation(summary = "평점 수정", description = "토큰이 필요합니다. 본인 평점만 수정할 수 있습니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "별점이 1~5가 아니거나 후기가 500자 초과 (COMMON4001)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = VALIDATION_FAILED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "토큰 없음 / 위조 / 만료",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = UNAUTHORIZED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "다른 회원의 평점 (RATING403_1)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = RATING_FORBIDDEN)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "없는 평점 (RATING404_1)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = RATING_NOT_FOUND)))
    @PatchMapping("/ratings/{ratingId}")
    public ResponseEntity<ApiResponse<RatingResponse>> update(
            @LoginMember Long memberId,
            @Parameter(description = "수정할 평점 ID", example = "1") @PathVariable Long ratingId,
            @Valid @RequestBody UpdateRatingRequest request
    ) {
        RatingResponse response = ratingService.update(memberId, ratingId, request);
        return ResponseEntity.ok(ApiResponse.ok("평점 수정에 성공했습니다.", response));
    }

    @Operation(summary = "평점 삭제", description = "토큰이 필요합니다. 본인 평점만 삭제할 수 있고, 공통 응답 형식을 유지하려고 204 대신 200과 result: null을 응답합니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "삭제 성공")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "토큰 없음 / 위조 / 만료",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = UNAUTHORIZED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "다른 회원의 평점 (RATING403_1)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = RATING_FORBIDDEN)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "없는 평점 (RATING404_1)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = RATING_NOT_FOUND)))
    @DeleteMapping("/ratings/{ratingId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @LoginMember Long memberId,
            @Parameter(description = "삭제할 평점 ID", example = "1") @PathVariable Long ratingId
    ) {
        ratingService.delete(memberId, ratingId);
        return ResponseEntity.ok(ApiResponse.ok("평점 삭제에 성공했습니다.", null));
    }
}
