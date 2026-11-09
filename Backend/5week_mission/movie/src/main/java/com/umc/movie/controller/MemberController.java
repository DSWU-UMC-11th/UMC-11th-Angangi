package com.umc.movie.controller;

import com.umc.movie.auth.LoginMember;
import com.umc.movie.dto.ApiResponse;
import com.umc.movie.dto.EmailCheckResponse;
import com.umc.movie.dto.MemberInfoResponse;
import com.umc.movie.dto.MemberResponse;
import com.umc.movie.dto.MemberUpdateRequest;
import com.umc.movie.dto.NicknameCheckResponse;
import com.umc.movie.dto.SignUpRequest;
import com.umc.movie.service.MemberService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static com.umc.movie.controller.docs.ApiExamples.EMAIL_DUPLICATED;
import static com.umc.movie.controller.docs.ApiExamples.JSON;
import static com.umc.movie.controller.docs.ApiExamples.MEMBER_NOT_FOUND;
import static com.umc.movie.controller.docs.ApiExamples.NICKNAME_DUPLICATED;
import static com.umc.movie.controller.docs.ApiExamples.UNAUTHORIZED;
import static com.umc.movie.controller.docs.ApiExamples.VALIDATION_FAILED;

@Tag(name = "회원", description = "회원가입·중복 확인은 공개, 내 정보 조회·수정은 토큰이 필요합니다.")
@RestController
@RequiredArgsConstructor
@RequestMapping("/members")
public class MemberController {

    private static final String EMAIL_REGEX = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";

    private final MemberService memberService;

    @Operation(summary = "닉네임 중복 확인", description = "토큰 없이 호출하는 공개 API입니다. 사용 가능하면 available: true입니다.")
    @SecurityRequirements
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "확인 성공")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "닉네임이 2~12자가 아님 (COMMON4001)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = VALIDATION_FAILED)))
    @GetMapping("/nickname/{nickname}")
    public NicknameCheckResponse checkNickname(
            @PathVariable
            @Size(min = 2, max = 12, message = "닉네임은 2자 이상 12자 이하로 입력해주세요.")
            String nickname
    ) {
        return memberService.checkNickname(nickname);
    }

    @Operation(summary = "이메일 중복 확인", description = "토큰 없이 호출하는 공개 API입니다. 사용 가능하면 available: true입니다.")
    @SecurityRequirements
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "확인 성공")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "이메일 형식 오류 (COMMON4001)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = VALIDATION_FAILED)))
    @GetMapping("/email/{email}")
    public EmailCheckResponse checkEmail(
            @PathVariable
            @Size(max = 254, message = "이메일은 254자 이하로 입력해주세요.")
            @Email(regexp = EMAIL_REGEX, message = "올바른 이메일 형식이 아닙니다.")
            String email
    ) {
        return memberService.checkEmail(email);
    }

    @Operation(summary = "회원가입", description = "이메일, 비밀번호, 닉네임으로 회원을 등록합니다. 토큰이 없어도 호출할 수 있는 공개 API입니다.")
    @SecurityRequirements
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "회원가입 성공")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "입력 규칙 위반 (COMMON4001)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = VALIDATION_FAILED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "이미 사용 중인 이메일(MEMBER4091) 또는 닉네임(MEMBER4092)",
            content = @Content(mediaType = JSON, examples = {
                    @ExampleObject(name = "이메일 중복", value = EMAIL_DUPLICATED),
                    @ExampleObject(name = "닉네임 중복", value = NICKNAME_DUPLICATED)
            }))
    @PostMapping
    public ResponseEntity<ApiResponse<MemberResponse>> signUp(
            @Valid @RequestBody SignUpRequest request
    ) {
        MemberResponse response = memberService.signUp(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created("회원가입에 성공했습니다.", response));
    }

    @Operation(summary = "내 정보 조회", description = "토큰이 필요합니다. 토큰의 회원 정보를 돌려줍니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "조회 성공")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "토큰 없음(AUTH401_2) / 위조(AUTH401_3) / 만료(AUTH401_4)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = UNAUTHORIZED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "토큰의 회원이 탈퇴 등으로 없음 (MEMBER404_1)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = MEMBER_NOT_FOUND)))
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberInfoResponse>> getMyInfo(
            @LoginMember Long memberId
    ) {
        MemberInfoResponse response = memberService.getMyInfo(memberId);
        return ResponseEntity.ok(ApiResponse.ok("회원 정보를 조회했습니다.", response));
    }

    @Operation(summary = "내 정보 수정", description = "토큰이 필요합니다. 닉네임을 바꿉니다.")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "수정 성공")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "닉네임이 비었거나 2~12자가 아님 (COMMON4001)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = VALIDATION_FAILED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "토큰 없음 / 위조 / 만료",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = UNAUTHORIZED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "이미 사용 중인 닉네임 (MEMBER4092)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = NICKNAME_DUPLICATED)))
    @PatchMapping("/me")
    public ResponseEntity<ApiResponse<MemberInfoResponse>> updateMyInfo(
            @LoginMember Long memberId,
            @Valid @RequestBody MemberUpdateRequest request
    ) {
        MemberInfoResponse response = memberService.updateMyInfo(memberId, request);
        return ResponseEntity.ok(ApiResponse.ok("회원 정보를 수정했습니다.", response));
    }
}
