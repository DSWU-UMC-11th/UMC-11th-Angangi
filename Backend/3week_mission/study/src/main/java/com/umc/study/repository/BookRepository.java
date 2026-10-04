package com.umc.study.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository // 스프링 컨테이너에 "나 창고지기 부품이야!"라고 등록
@RequiredArgsConstructor
public class BookRepository {

    // 스프링의 DB 통신 도구(JdbcTemplate) 주입
    private final JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> findAll() {
        String sql = "SELECT * FROM book";

        // 쿼리를 실행하고 결과를 List<Map> 형태로 가져옴 (Key: 컬럼명, Value: 데이터)
        return jdbcTemplate.queryForList(sql);
    }
}
