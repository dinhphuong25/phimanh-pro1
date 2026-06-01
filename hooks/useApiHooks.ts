"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { apiCache } from "@/lib/api-cache";

interface NewUpdatesData {
    movies: any[];
    heroMovie: any | null;
    topicsWithMovies: any[];
}

const API_BASE = "https://phimapi.com";
const REFRESH_INTERVAL = 60000; // 60 seconds - optimized refresh interval
const CACHE_TTL = 30000; // 30 seconds cache

// Phim luôn được ghim làm phim nổi bật trên trang chủ
const FEATURED_MOVIE_SLUG = "avatar-lua-va-tro-tan";

// Fetch thông tin phim được ghim để làm hero
async function fetchFeaturedMovie(): Promise<any | null> {
    const cacheKey = `featured-${FEATURED_MOVIE_SLUG}`;
    
    return apiCache.fetchWithCache(cacheKey, async () => {
        try {
            const res = await fetch(`${API_BASE}/phim/${FEATURED_MOVIE_SLUG}`, {
                headers: {
                    Referer: "https://phimanh.netlify.app",
                    "User-Agent": "phimanh-bot/1.0",
                },
            });
            if (!res.ok) return null;
            const data = await res.json();
            return data.movie || null;
        } catch {
            return null;
        }
    }, 300000); // Cache featured movie for 5 minutes
}

async function fetchNewUpdates(): Promise<any[]> {
    const cacheKey = "new-updates-v2";
    
    return apiCache.fetchWithCache(cacheKey, async () => {
        const res = await fetch(`${API_BASE}/danh-sach/phim-moi-cap-nhat-v2?page=1&limit=30`, {
            headers: {
                Referer: "https://phimanh.netlify.app",
                "User-Agent": "phimanh-bot/1.0",
            },
        });
        if (!res.ok) throw new Error("Failed to fetch new updates");
        const data = await res.json();
        const movies = data.items || [];

        // Sort by quality - FHD first, then HD, then others
        const qualityOrder: { [key: string]: number } = {
            'FHD': 1,
            'HD': 2,
            'SD': 3,
            'CAM': 4
        };

        movies.sort((a: any, b: any) => {
            const qA = qualityOrder[a.quality?.toUpperCase()] || 5;
            const qB = qualityOrder[b.quality?.toUpperCase()] || 5;
            return qA - qB;
        });

        return movies.slice(0, 20);
    }, CACHE_TTL);
}

async function fetchTopicMovies(slug: string, limit: number = 6): Promise<any[]> {
    const cacheKey = `topic-${slug}-${limit}`;
    
    return apiCache.fetchWithCache(cacheKey, async () => {
        const res = await fetch(`${API_BASE}/v1/api/danh-sach/${slug}?page=1&limit=${limit}`, {
            headers: {
                Referer: "https://phimanh.netlify.app",
                "User-Agent": "phimanh-bot/1.0",
            },
        });
        if (!res.ok) throw new Error(`Failed to fetch topic: ${slug}`);
        const data = await res.json();
        return data.data?.items || [];
    }, 120000); // Cache topics for 2 minutes
}

export function useNewUpdates() {
    const [movies, setMovies] = useState<any[]>([]);
    const [heroMovie, setHeroMovie] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const isMounted = useRef(true);
    const fetchInProgress = useRef(false);

    const fetchData = useCallback(async (isRefresh = false) => {
        // Prevent duplicate fetches
        if (fetchInProgress.current && !isRefresh) return;
        fetchInProgress.current = true;

        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }

            // Fetch cả phim featured và phim mới cập nhật song song
            const [featuredMovie, newMovies] = await Promise.all([
                fetchFeaturedMovie(),
                fetchNewUpdates()
            ]);

            if (isMounted.current) {
                setMovies(newMovies);
                // Ưu tiên phim featured làm hero, fallback về phim mới nhất
                setHeroMovie(featuredMovie || newMovies[0] || null);
                setLastUpdated(new Date());
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            }
        } finally {
            fetchInProgress.current = false;
            if (isMounted.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, []);

    const refresh = useCallback(() => {
        // Clear cache before refreshing
        apiCache.delete("new-updates-v2");
        fetchData(true);
    }, [fetchData]);

    // Initial fetch
    useEffect(() => {
        isMounted.current = true;
        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, [fetchData]);

    // Auto-refresh with optimized interval
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === "visible" && !fetchInProgress.current) {
                fetchData(true);
            }
        }, REFRESH_INTERVAL);

        return () => clearInterval(interval);
    }, [fetchData]);

    // Refresh on visibility change
    useEffect(() => {
        const handleVisibility = () => {
            if (document.visibilityState === "visible" && lastUpdated) {
                const elapsed = Date.now() - lastUpdated.getTime();
                if (elapsed > REFRESH_INTERVAL && !fetchInProgress.current) {
                    fetchData(true);
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibility);
        return () => document.removeEventListener("visibilitychange", handleVisibility);
    }, [lastUpdated, fetchData]);

    return useMemo(() => ({
        movies,
        heroMovie,
        loading,
        error,
        refresh,
        lastUpdated,
        isRefreshing,
    }), [movies, heroMovie, loading, error, refresh, lastUpdated, isRefreshing]);
}

export function useTopicsWithMovies(topics: any[]) {
    const [topicsData, setTopicsData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useRef(true);
    const fetchInProgress = useRef(false);

    // Memoize topics string to prevent unnecessary re-fetches
    const topicsKey = useMemo(() => topics.map(t => t.slug).join(','), [topics]);

    const fetchData = useCallback(async () => {
        if (!topics || topics.length === 0 || fetchInProgress.current) {
            setLoading(false);
            return;
        }

        fetchInProgress.current = true;

        try {
            setLoading(true);

            const results = await Promise.all(
                topics.map(async (topic) => {
                    try {
                        const movies = await fetchTopicMovies(topic.slug, 6);
                        return { ...topic, movies };
                    } catch {
                        return { ...topic, movies: [] };
                    }
                })
            );

            if (isMounted.current) {
                setTopicsData(results);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            }
        } finally {
            fetchInProgress.current = false;
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [topicsKey]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, [fetchData]);

    // Auto-refresh every 2 minutes for topics
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === "visible" && !fetchInProgress.current) {
                fetchData();
            }
        }, 120000);

        return () => clearInterval(interval);
    }, [fetchData]);

    return useMemo(() => ({ topicsData, loading, error }), [topicsData, loading, error]);
}

export function useSearchMovies(query: string, page: number = 1) {
    const [movies, setMovies] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const isMounted = useRef(true);

    const fetchData = useCallback(async () => {
        if (!query) {
            setMovies([]);
            setLoading(false);
            return;
        }

        const cacheKey = `search-${query}-${page}`;

        try {
            setLoading(true);

            const data = await apiCache.fetchWithCache(cacheKey, async () => {
                const res = await fetch(
                    `${API_BASE}/v1/api/tim-kiem?keyword=${encodeURIComponent(query)}&limit=20&page=${page}`,
                    {
                        headers: {
                            Referer: "https://phimanh.netlify.app",
                            "User-Agent": "phimanh-bot/1.0",
                        },
                    }
                );

                if (!res.ok) throw new Error("Search failed");
                return res.json();
            }, 60000); // Cache search for 1 minute

            if (isMounted.current) {
                setMovies(data.data?.items || []);
                setPagination(data.data?.params?.pagination || null);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
                setMovies([]);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [query, page]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, [fetchData]);

    return useMemo(() => ({ movies, pagination, loading, error }), [movies, pagination, loading, error]);
}

export function useFilteredMovies(params: {
    typeList?: string;
    page?: number;
    sortField?: string;
    sortType?: string;
    category?: string;
    country?: string;
    year?: string;
    limit?: number;
}) {
    const [movies, setMovies] = useState<any[]>([]);
    const [pagination, setPagination] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const isMounted = useRef(true);
    const fetchInProgress = useRef(false);

    // Memoize params to prevent unnecessary re-fetches
    const paramsKey = useMemo(() => JSON.stringify(params), [params]);

    const fetchData = useCallback(async (isRefresh = false) => {
        if (fetchInProgress.current && !isRefresh) return;
        fetchInProgress.current = true;

        try {
            if (isRefresh) {
                setIsRefreshing(true);
            } else {
                setLoading(true);
            }

            const {
                typeList = "phim-bo",
                page = 1,
                sortField = "modified.time",
                sortType = "desc",
                category,
                country,
                year,
                limit = 20,
            } = params;

            let url = `${API_BASE}/v1/api/danh-sach/${typeList}?page=${page}&sort_field=${sortField}&sort_type=${sortType}&limit=${limit}`;

            if (category) url += `&category=${category}`;
            if (country) url += `&country=${country}`;
            if (year) url += `&year=${year}`;

            const cacheKey = `filtered-${url}`;

            const data = await apiCache.fetchWithCache(cacheKey, async () => {
                const res = await fetch(url, {
                    headers: {
                        Referer: "https://phimanh.netlify.app",
                        "User-Agent": "phimanh-bot/1.0",
                    },
                });

                if (!res.ok) throw new Error("Failed to fetch filtered movies");
                return res.json();
            }, 60000); // Cache filtered results for 1 minute

            if (isMounted.current) {
                setMovies(data.data?.items || []);
                setPagination(data.data?.params?.pagination || null);
                setError(null);
            }
        } catch (err) {
            if (isMounted.current) {
                setError(err instanceof Error ? err : new Error("Unknown error"));
            }
        } finally {
            fetchInProgress.current = false;
            if (isMounted.current) {
                setLoading(false);
                setIsRefreshing(false);
            }
        }
    }, [paramsKey]);

    const refresh = useCallback(() => {
        fetchData(true);
    }, [fetchData]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();

        return () => {
            isMounted.current = false;
        };
    }, [fetchData]);

    // Auto-refresh every 2 minutes
    useEffect(() => {
        const interval = setInterval(() => {
            if (document.visibilityState === "visible" && !fetchInProgress.current) {
                fetchData(true);
            }
        }, 120000);

        return () => clearInterval(interval);
    }, [fetchData]);

    return useMemo(() => ({ 
        movies, pagination, loading, error, refresh, isRefreshing 
    }), [movies, pagination, loading, error, refresh, isRefreshing]);
}
