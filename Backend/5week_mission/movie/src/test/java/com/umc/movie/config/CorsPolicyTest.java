package com.umc.movie.config;

import com.umc.movie.controller.MemberController;
import com.umc.movie.dto.NicknameCheckResponse;
import com.umc.movie.service.MemberService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.cors.CorsConfiguration;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class CorsPolicyTest {

    private static final String FRONT_ORIGIN = "http://localhost:5173";
    private static final String OTHER_ORIGIN = "http://localhost:5174";

    @Nested
    @WebMvcTest(MemberController.class)
    class 특정_출처만_허용할_때 {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private MemberService memberService;

        @BeforeEach
        void setUp() {
            given(memberService.checkNickname(anyString())).willReturn(new NicknameCheckResponse(true));
        }

        @Test
        void 허용한_출처에는_그_출처를_그대로_돌려준다() throws Exception {
            mockMvc.perform(get("/members/nickname/noco").header("Origin", FRONT_ORIGIN))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", FRONT_ORIGIN))
                    .andExpect(header().string("Vary", containsString("Origin")));
        }

        @Test
        void 허용하지_않은_출처는_거부한다() throws Exception {
            mockMvc.perform(get("/members/nickname/noco").header("Origin", OTHER_ORIGIN))
                    .andExpect(status().isForbidden())
                    .andExpect(header().doesNotExist("Access-Control-Allow-Origin"));
        }

        @Test
        void 허용한_출처의_preflight에는_허용_메서드를_알려준다() throws Exception {
            mockMvc.perform(options("/members/nickname/noco")
                            .header("Origin", FRONT_ORIGIN)
                            .header("Access-Control-Request-Method", "PATCH"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", FRONT_ORIGIN))
                    .andExpect(header().string("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE"));
        }

        @Test
        void 허용하지_않은_메서드의_preflight는_거부한다() throws Exception {
            mockMvc.perform(options("/members/nickname/noco")
                            .header("Origin", FRONT_ORIGIN)
                            .header("Access-Control-Request-Method", "PUT"))
                    .andExpect(status().isForbidden());
        }
    }

    @Nested
    @WebMvcTest(MemberController.class)
    @TestPropertySource(properties = "cors.allowed-origins=*")
    class 모든_출처를_허용할_때 {

        @Autowired
        private MockMvc mockMvc;

        @MockitoBean
        private MemberService memberService;

        @BeforeEach
        void setUp() {
            given(memberService.checkNickname(anyString())).willReturn(new NicknameCheckResponse(true));
        }

        @Test
        void 어떤_출처든_와일드카드로_허용한다() throws Exception {
            mockMvc.perform(get("/members/nickname/noco").header("Origin", FRONT_ORIGIN))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", "*"));

            mockMvc.perform(get("/members/nickname/noco").header("Origin", OTHER_ORIGIN))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", "*"));

            mockMvc.perform(get("/members/nickname/noco").header("Origin", "https://evil.example.com"))
                    .andExpect(status().isOk())
                    .andExpect(header().string("Access-Control-Allow-Origin", "*"));
        }
    }

    @Test
    void 와일드카드와_allowCredentials는_함께_쓸_수_없다() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("*"));
        config.setAllowCredentials(true);

        assertThatThrownBy(config::validateAllowCredentials)
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("allowedOriginPatterns");
    }
}
