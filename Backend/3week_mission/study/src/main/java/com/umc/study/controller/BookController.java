package com.umc.study.controller;

import com.umc.study.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController // 데이터를 JSON으로 서빙하는 API 카운터
@RequestMapping("/books") // 기본 주소: /books
@RequiredArgsConstructor
public class BookController {

    // 주방장(Service) 주입
    private final BookService bookService;

    // GET /books 요청 처리
    @GetMapping
    public List<Map<String, Object>> getBooks() {
        return bookService.getAllBooks();
    }
}
