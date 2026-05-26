const placeholderDailyChallenge = {
  date: "2026-05-26",
  pairs: [
    {
      id: "pair-1",
      game1: {
        id: 101,
        name: "Nebula Drift",
        short_description:
          "Pilot a salvage crew through shifting nebulae in this tactical roguelite.",
        header_image: "https://placehold.co/640x360?text=Nebula+Drift",
        review_count: 12450,
        review_score_desc: "Very Positive",
        review_sentiment: "87%",
        developers: ["Starforge Studio"],
        publishers: ["Orbit Arcade"],
        release_date: "Apr 14, 2021",
        price: "$19.99",
        achievements: {
          total: 24,
          highlighted: [
            {
              name: "First Flight",
              path: "https://placehold.co/32x32?text=1",
            },
            {
              name: "Void Runner",
              path: "https://placehold.co/32x32?text=2",
            },
            {
              name: "Deep Scan",
              path: "https://placehold.co/32x32?text=3",
            },
          ],
        },
        movies: [],
        screenshots: [
          {
            id: 1001,
            path_full:
              "https://placehold.co/960x540?text=Nebula+Drift+1",
            path_thumbnail:
              "https://placehold.co/320x180?text=Nebula+Drift+1",
          },
          {
            id: 1002,
            path_full:
              "https://placehold.co/960x540?text=Nebula+Drift+2",
            path_thumbnail:
              "https://placehold.co/320x180?text=Nebula+Drift+2",
          },
        ],
      },
      game2: {
        id: 202,
        name: "Clockwork Harbor",
        short_description:
          "Build a floating city of gears and steamships, and keep the tides at bay.",
        header_image: "https://placehold.co/640x360?text=Clockwork+Harbor",
        review_count: 8750,
        review_score_desc: "Mostly Positive",
        review_sentiment: "74%",
        developers: ["Harborline Works"],
        publishers: ["Harborline Works"],
        release_date: "Sep 2, 2019",
        price: "$24.99",
        achievements: {
          total: 18,
          highlighted: [
            {
              name: "First Dock",
              path: "https://placehold.co/32x32?text=A",
            },
            {
              name: "Steam Baron",
              path: "https://placehold.co/32x32?text=B",
            },
          ],
        },
        movies: [],
        screenshots: [
          {
            id: 2001,
            path_full:
              "https://placehold.co/960x540?text=Clockwork+Harbor+1",
            path_thumbnail:
              "https://placehold.co/320x180?text=Clockwork+Harbor+1",
          },
          {
            id: 2002,
            path_full:
              "https://placehold.co/960x540?text=Clockwork+Harbor+2",
            path_thumbnail:
              "https://placehold.co/320x180?text=Clockwork+Harbor+2",
          },
        ],
      },
    },
  ],
};

export const useDailyChallenge = () => ({
  data: placeholderDailyChallenge,
  isLoading: false,
  isError: false,
});
