package com.umc.study.controller;

import com.umc.study.dto.BookResponse;
import com.umc.study.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public List<BookResponse> getBooks() {
        return bookService.getBooks();
    }

    // 3주차 Raw SQL 방식 (main 브랜치에 보존) - 4주차 범위 아님
    // @GetMapping("/category/{categoryId}")
    // public List<Map<String, Object>> getBooksByCategory(@PathVariable Long categoryId) {
    //     return bookService.getBooksByCategory(categoryId);
    // }

    // TODO: 실습 2에서 CreateBookRequest DTO 방식으로 다시 구현
    // @PostMapping
    // public String createBook(@RequestBody Map<String, Object> body) {
    //     bookService.createBook(body);
    //     return "도서 등록이 완료되었습니다!";
    // }
}
