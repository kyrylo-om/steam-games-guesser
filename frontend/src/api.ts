import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from "@tanstack/react-query";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "/api";

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

async function request<T>(
  endpoint: string,
  baseUrl: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  const urlString = `${baseUrl}${endpoint}`;
  const url = new URL(urlString, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  const response = await fetch(url.toString(), {
    ...fetchOptions,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function useGetGameByID(
  gameId?: number,
  options?: Omit<UseQueryOptions<unknown, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["game", gameId],
    queryFn: () =>
      request("/api/games/fetch/", "", {
        params: { app_id: gameId },
      }),
    enabled: !!gameId,
    ...options,
  });
}

export function useGetFullGameData(
  gameId?: number,
  options?: Omit<UseQueryOptions<unknown, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["game-full", gameId],
    queryFn: () =>
      request("/api/games/full_data/", "", {
        params: { app_id: gameId },
      }),
    enabled: !!gameId,
    ...options,
  });
}

export interface GameComparison {
  game1: {
    app_id: number;
    name: string;
    header_image: string;
    review_count: number;
    review_sentiment: string;
    release_date: string;
    price: string | number;
    current_online: number;
  };
  game2: {
    app_id: number;
    name: string;
    header_image: string;
    review_count: number;
    review_sentiment: string;
    release_date: string;
    price: string | number;
    current_online: number;
  };
}

export function useGameComparison(
  appid1?: number,
  appid2?: number,
  options?: Omit<UseQueryOptions<GameComparison, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["game-comparison", appid1, appid2],
    queryFn: () =>
      request<GameComparison>("/api/games/compare/", "", {
        params: { appid1, appid2 },
      }),
    enabled: !!appid1 && !!appid2,
    ...options,
  });
}

export interface DailyChallengeGame {
  app_id: number;
  name: string;
  header_image: string;
  review_count: number;
  review_sentiment: string;
  release_date: string;
  price: string | number;
  current_online: number;
}

export interface DailyChallengePair {
  id: number;
  game1: DailyChallengeGame;
  game2: DailyChallengeGame;
}

export interface DailyChallengeResponse {
  date: string;
  pairs: DailyChallengePair[];
}

export function useDailyChallenge(
  options?: Omit<UseQueryOptions<DailyChallengeResponse, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: ["daily-challenge"],
    queryFn: () => request<DailyChallengeResponse>("/api/games/daily_challenge/", "", {}),
    ...options,
  });
}
