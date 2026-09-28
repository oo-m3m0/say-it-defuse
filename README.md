# 말로 풀어라 (say-it-defuse)

소통 교육용 협동 해체 게임. 한 명(해체자)은 장치 화면을, 나머지(전문가)는 설명서를 본다. 서로 화면을 볼 수 없고 말로만 푼다. 협동 해체 장르에서 영감을 받았고, 규칙표, 기호, 색, 표시등 이름은 전부 자체 제작이다.

## 쓰는 법
- `/` 역할 선택
- `/bomb` 해체자. 진행자가 부르는 라운드 코드(R1, R2, R3, 변형은 R2-B)를 입력하면 시작. 같은 코드면 모든 팀이 같은 장치를 받는다.
- `/manual` 전문가 설명서. 라운드를 고르면 그 라운드 모듈만 보인다.
- `/host` 진행자 안내(40분 진행표, 규칙 설명, 디브리핑 질문, 답 확인기).

## 구조
백엔드 없음. 정적 HTML + ES 모듈, 의존성 0.
- `src/rng.js` 코드 문자열 → 시드 PRNG. `Math.random` 사용 안 함.
- `src/conditions.js` 규칙 조건 DSL. 판정(`evalCond`)과 설명서 문장(`describeCond`)이 같은 데이터를 읽는다.
- `src/modules/*` 전선, 버튼, 기호 키패드, 비밀번호, 다이얼. 각 모듈은 `generate / solve / check / enumerateActions / manual`.
- `src/bomb.js` 라운드 코드 → 장치 전체.

## 개발
```
npm test          # 시드 2000개 × 3레벨에서 모듈마다 정답이 정확히 하나인지 검사
SEEDS=10000 npm test
python3 -m http.server 8080   # ES 모듈이라 file://로는 안 열림
```

MIT
