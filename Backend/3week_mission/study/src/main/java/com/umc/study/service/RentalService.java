package com.umc.study.service;

import com.umc.study.repository.RentalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;

    public void createRental(Map<String, Object> body) {
        rentalRepository.save(body);
    }

    public void returnRental(Long rentalId) {
        int updatedRows = rentalRepository.updateReturnedAt(rentalId);

        // 바뀐 행이 없으면 존재하지 않는 대여 기록이므로 404 응답
        if (updatedRows == 0) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "존재하지 않는 대여 기록입니다.");
        }
    }
}
