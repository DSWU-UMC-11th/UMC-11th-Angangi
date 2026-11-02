// 영화 카드와 검색 결과 항목이 화면에 그릴 때 사용하는 타입이에요
export interface MovieCardItem {
  id: number;
  title: string;
  originalTitle: string;
  releaseDate: string;
  posterUrl: string | null;
  overview: string;
}
