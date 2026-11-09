// 서버 FavoriteResponse
interface Favorite {
  favoriteId: number;
  movieId: number;
  createdAt: string;
}

// 서버 FavoriteStatusResponse
interface FavoriteStatus {
  isFavorite: boolean;
}

export type { Favorite, FavoriteStatus };
