#!/usr/bin/env bash
# 같은 이메일로 회원가입 요청을 동시에 보내 DB UNIQUE 제약 위반을 재현합니다.
# 사용법: ./scripts/concurrent-signup.sh [요청 수(기본 10)] [서버 주소(기본 http://localhost:8080)]

COUNT=${1:-10}
BASE_URL=${2:-http://localhost:8080}
RUN_ID=$(date +%s | tail -c 5)
EMAIL="race${RUN_ID}@umc.com"
RESULT_DIR=$(mktemp -d)

echo "같은 이메일(${EMAIL})로 회원가입 요청 ${COUNT}개를 동시에 보냅니다."

for i in $(seq 1 "$COUNT"); do
  curl -s -o "${RESULT_DIR}/${i}.json" -w "%{http_code}" \
    -X POST "${BASE_URL}/members" \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"${EMAIL}\", \"password\": \"Umc!1234\", \"nickname\": \"r${RUN_ID}_${i}\"}" \
    > "${RESULT_DIR}/${i}.status" &
done
wait

for i in $(seq 1 "$COUNT"); do
  echo "[요청 ${i}] $(cat "${RESULT_DIR}/${i}.status") $(cat "${RESULT_DIR}/${i}.json")"
done

echo
echo "상태 코드별 개수"
cat "${RESULT_DIR}"/*.status | sort | uniq -c
echo
echo "서버 로그에서 'DB UNIQUE 제약 위반: key=email'이 찍힌 요청은 서비스의 사전 중복 검사를 통과한 뒤 DB에서 막힌 요청입니다."

rm -rf "${RESULT_DIR}"
