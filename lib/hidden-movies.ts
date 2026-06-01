// Danh sách các phim bị ẩn tạm thời (theo slug)
// Để ẩn một phim, thêm slug của phim vào danh sách này
// Để bỏ ẩn, xóa slug khỏi danh sách

export const HIDDEN_MOVIE_SLUGS: string[] = [
    // Danh sách trống - không có phim nào bị ẩn
];

// Helper function để kiểm tra phim có bị ẩn không
export function isMovieHidden(movie: any): boolean {
    const slug = movie?.slug || "";
    return HIDDEN_MOVIE_SLUGS.includes(slug);
}

// Helper function để lọc bỏ các phim bị ẩn
export function filterHiddenMovies<T extends { slug?: string }>(movies: T[]): T[] {
    return movies.filter((movie) => !HIDDEN_MOVIE_SLUGS.includes(movie.slug || ""));
}
