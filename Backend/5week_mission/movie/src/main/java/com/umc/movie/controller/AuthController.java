package com.umc.movie.controller;

import com.umc.movie.dto.ApiResponse;
import com.umc.movie.dto.LoginRequest;
import com.umc.movie.dto.LoginResponse;
import com.umc.movie.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import static com.umc.movie.controller.docs.ApiExamples.JSON;
import static com.umc.movie.controller.docs.ApiExamples.LOGIN_FAILED;
import static com.umc.movie.controller.docs.ApiExamples.VALIDATION_FAILED;

@Tag(name = "인증", description = "로그인하고 Access Token을 발급받습니다.")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "이메일 로그인",
            description = """
                    이메일과 비밀번호로 로그인하고 Access Token을 발급받습니다. 토큰 없이 호출하는 공개 API입니다.
                    응답의 result.accessToken을 위쪽 Authorize 버튼에 넣어두면 자물쇠가 있는 API에 자동으로 실립니다.
                    """
    )
    @SecurityRequirements
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "로그인 성공, accessToken 발급")
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "이메일 형식 오류 또는 빈 값 (COMMON4001)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = VALIDATION_FAILED)))
    @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "이메일이 없거나 비밀번호가 틀림 (AUTH401_1)",
            content = @Content(mediaType = JSON, examples = @ExampleObject(value = LOGIN_FAILED)))
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("로그인에 성공했습니다.", response));
    }
}
