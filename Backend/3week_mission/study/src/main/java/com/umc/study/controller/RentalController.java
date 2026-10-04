package com.umc.study.controller;

import com.umc.study.service.RentalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/rentals")
@RequiredArgsConstructor
public class RentalController {

    private final RentalService rentalService;

    // POST /rentals 요청 처리 (생성 성공 시 201 Created 응답)
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public String createRental(@RequestBody Map<String, Object> body) {
        rentalService.createRental(body);
        return "도서 대여가 완료되었습니다!";
    }

    // PATCH /rentals/{rentalId}/return 요청 처리 (반납일을 현재 시간으로 갱신)
    @PatchMapping("/{rentalId}/return")
    public String returnRental(@PathVariable Long rentalId) {
        rentalService.returnRental(rentalId);
        return "도서 반납이 완료되었습니다!";
    }
}
