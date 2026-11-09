package com.umc.movie.config;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class OpenApiDocsTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void 문서와_Swagger_UI는_토큰_없이_열린다() throws Exception {
        mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk());
        mockMvc.perform(get("/swagger-ui/index.html")).andExpect(status().isOk());
    }

    @Test
    void 팔주차_API가_문서에_있고_Bearer_인증_방식이_등록된다() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(jsonPath("$.paths['/favorites'].post").exists())
                .andExpect(jsonPath("$.paths['/favorites'].get").exists())
                .andExpect(jsonPath("$.paths['/favorites/{movieId}'].get").exists())
                .andExpect(jsonPath("$.paths['/favorites/{movieId}'].delete").exists())
                .andExpect(jsonPath("$.paths['/movie-records'].post").exists())
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.scheme").value("bearer"))
                .andExpect(jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").value("JWT"));
    }

    @Test
    void 실패_응답_코드가_문서에_적힌다() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(jsonPath("$.paths['/favorites'].post.responses['409']").exists())
                .andExpect(jsonPath("$.paths['/favorites/{movieId}'].delete.responses['404']").exists())
                .andExpect(jsonPath("$.paths['/movie-records'].post.responses['409'].content['application/json'].examples").exists());
    }

    @Test
    void LoginMember_파라미터는_요청_파라미터로_노출되지_않는다() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(jsonPath("$.paths['/favorites'].get.parameters").doesNotExist())
                .andExpect(jsonPath("$.paths['/favorites/{movieId}'].get.parameters[*].name", not(hasItem("memberId"))));
    }

    @Test
    void 공개_API는_자물쇠가_없고_잠긴_API는_전역_Bearer를_따른다() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(jsonPath("$.security[0].bearerAuth").exists())
                .andExpect(jsonPath("$.paths['/auth/login'].post.security").isEmpty())
                .andExpect(jsonPath("$.paths['/members'].post.security").isEmpty())
                .andExpect(jsonPath("$.paths['/members/{memberId}/ratings'].get.security").isEmpty())
                .andExpect(jsonPath("$.paths['/favorites'].post.security").doesNotExist());
    }
}
