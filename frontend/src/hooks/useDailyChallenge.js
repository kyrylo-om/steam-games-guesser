import { useQuery } from "@tanstack/react-query";
import { fetchDailyChallenge } from "../api/games";

export const useDailyChallenge = () => {
  return useQuery({
    queryKey: ["dailyChallenge"],
    queryFn: fetchDailyChallenge,
    staleTime: 1000 * 60,
  });
};
