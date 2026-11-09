interface Favorite {
  favoriteId: number;
  movieId: number;
  createdAt: string;
}

interface FavoriteStatus {
  isFavorite: boolean;
}

export type { Favorite, FavoriteStatus };
