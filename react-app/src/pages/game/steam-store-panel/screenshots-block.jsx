import Hls from "hls.js";
import { useEffect, useMemo, useRef, useState } from "react";
import RevealWrapper from "./reveal-wrapper";
import styles from "./screenshots-block.module.css";

const ScreenshotsBlock = ({ game, isRevealed = true, isPending = false }) => {
  const movieVideoRef = useRef(null);
  const timelineRef = useRef(null);
  const [isMoviePlaying, setIsMoviePlaying] = useState(false);
  const [movieProgress, setMovieProgress] = useState(0);
  const [movieDuration, setMovieDuration] = useState(0);
  const headerImage = game.thumbnail;

  const mediaItems = useMemo(() => {
    const movieItems = (game.videos || []).map((item, index) => ({
      id: `movie-${item.id ?? index}`,
      kind: "movie",
      title: `Trailer ${index + 1}`,
      thumb: item.thumbnail || headerImage,
      hlsUrl: item.video || null,
    }));

    const screenshotItems = (game.screenshots || []).map((item, index) => ({
      id: `screenshot-${item.id ?? index}`,
      kind: "screenshot",
      title: `Screenshot ${index + 1}`,
      thumb: item || headerImage,
      src: item || headerImage,
    }));

    const items = [...movieItems, ...screenshotItems];

    if (items.length === 0 && headerImage) {
      items.push({
        id: "header-image",
        kind: "image",
        title: game.name,
        thumb: headerImage,
        src: headerImage,
      });
    }

    return items;
  }, [game.videos, game.screenshots, headerImage, game.name]);

  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const activeMedia = mediaItems[activeMediaIndex] || mediaItems[0];

  const goToPreviousMedia = () => {
    if (!mediaItems.length) return;
    setActiveMediaIndex(
      (current) => (current - 1 + mediaItems.length) % mediaItems.length,
    );
  };

  const goToNextMedia = () => {
    if (!mediaItems.length) return;
    setActiveMediaIndex((current) => (current + 1) % mediaItems.length);
  };

  useEffect(() => {
    const videoElement = movieVideoRef.current;
    let hlsInstance = null;
    const movieUrl = activeMedia?.hlsUrl || null;
    const isHlsStream = Boolean(
      activeMedia?.hlsUrl &&
      (() => {
        try {
          return new URL(activeMedia.hlsUrl).pathname.endsWith(".m3u8");
        } catch {
          return activeMedia.hlsUrl.includes(".m3u8");
        }
      })(),
    );
    const canPlayNativeHls =
      typeof videoElement?.canPlayType === "function" &&
      (videoElement.canPlayType("application/vnd.apple.mpegurl") ||
        videoElement.canPlayType("application/x-mpegURL"));

    if (!videoElement || activeMedia?.kind !== "movie") {
      if (videoElement) {
        videoElement.pause();
        videoElement.removeAttribute("src");
        videoElement.load();
        videoElement.currentTime = 0;
      }
      setIsMoviePlaying(false);
      setMovieProgress(0);
      setMovieDuration(0);
      return;
    }

    const handlePlay = () => setIsMoviePlaying(true);
    const handlePause = () => setIsMoviePlaying(false);
    const handleTimeUpdate = () =>
      setMovieProgress(videoElement.currentTime || 0);
    const handleLoadedMetadata = () => {
      setMovieDuration(
        Number.isFinite(videoElement.duration) ? videoElement.duration : 0,
      );
      setMovieProgress(videoElement.currentTime || 0);
    };

    videoElement.addEventListener("play", handlePlay);
    videoElement.addEventListener("pause", handlePause);
    videoElement.addEventListener("timeupdate", handleTimeUpdate);
    videoElement.addEventListener("loadedmetadata", handleLoadedMetadata);

    if (movieUrl) {
      if (isHlsStream && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
        });
        hlsInstance.loadSource(activeMedia.hlsUrl);
        hlsInstance.attachMedia(videoElement);
      } else if (isHlsStream && canPlayNativeHls) {
        videoElement.src = activeMedia.hlsUrl;
      } else {
        videoElement.src = movieUrl;
      }
    }

    return () => {
      videoElement.removeEventListener("play", handlePlay);
      videoElement.removeEventListener("pause", handlePause);
      videoElement.removeEventListener("timeupdate", handleTimeUpdate);
      videoElement.removeEventListener("loadedmetadata", handleLoadedMetadata);
      videoElement.pause();
      videoElement.removeAttribute("src");
      videoElement.load();
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [activeMedia?.kind, activeMedia?.hlsUrl, activeMediaIndex]);

  const handleMoviePlayButtonClick = () => {
    const videoElement = movieVideoRef.current;

    if (!videoElement) return;

    if (videoElement.paused) {
      videoElement.play().catch(() => {});
      return;
    }

    videoElement.pause();
  };

  const seekMovieToClientX = (clientX) => {
    const videoElement = movieVideoRef.current;
    const timelineElement = timelineRef.current;

    if (!videoElement || !timelineElement || !movieDuration) return;

    const rect = timelineElement.getBoundingClientRect();
    const percentage = Math.min(
      1,
      Math.max(0, (clientX - rect.left) / rect.width),
    );
    const nextTime = percentage * movieDuration;

    videoElement.currentTime = nextTime;
    setMovieProgress(nextTime);
  };

  const handleTimelineClick = (event) => {
    event.preventDefault();
    seekMovieToClientX(event.clientX);
  };

  const handleTimelinePointerDown = (event) => {
    if (event.button !== 0) return;

    event.preventDefault();
    seekMovieToClientX(event.clientX);

    const handlePointerMove = (moveEvent) => {
      seekMovieToClientX(moveEvent.clientX);
    };

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  return (
    <div className={styles.screenshotsBlock}>
      <RevealWrapper isRevealed={isRevealed} placeholderText={"Media"} isPending={isPending}>
        <div className={styles.screenshotsContent}>
          <div className={styles.carouselStage}>
            {activeMedia?.kind === "movie" ? (
              <div className={styles.carouselMovieShell}>
                <video
                  ref={movieVideoRef}
                  className={styles.carouselImage}
                  poster={activeMedia.thumb}
                  playsInline
                  preload="metadata"
                />
                <button
                  type="button"
                  className={styles.carouselPlayButton}
                  onClick={handleMoviePlayButtonClick}
                  aria-label={isMoviePlaying ? "Pause trailer" : "Play trailer"}
                >
                  <span className={styles.carouselPlayIcon}>
                    {isMoviePlaying ? "❚❚" : "▶"}
                  </span>
                </button>
                <button
                  ref={timelineRef}
                  type="button"
                  className={styles.carouselTimeline}
                  onClick={handleTimelineClick}
                  onPointerDown={handleTimelinePointerDown}
                  aria-label="Seek trailer playback"
                >
                  <div
                    className={styles.carouselTimelineProgress}
                    style={{
                      width:
                        movieDuration > 0
                          ? `${Math.min(100, (movieProgress / movieDuration) * 100)}%`
                          : "0%",
                    }}
                  />
                </button>
              </div>
            ) : (
              <img
                className={styles.carouselImage}
                src={activeMedia?.src || headerImage}
                alt={activeMedia?.title || game.name}
              />
            )}

            <div className={styles.carouselShade} />

            {mediaItems.length > 1 && (
              <>
                <button
                  className={`${styles.carouselNav} ${styles.carouselNavLeft}`}
                  onClick={goToPreviousMedia}
                  type="button"
                  aria-label="Previous media"
                >
                  ‹
                </button>
                <button
                  className={`${styles.carouselNav} ${styles.carouselNavRight}`}
                  onClick={goToNextMedia}
                  type="button"
                  aria-label="Next media"
                >
                  ›
                </button>
                <div className={styles.carouselCounter}>
                  {activeMediaIndex + 1} / {mediaItems.length}
                </div>
              </>
            )}
          </div>

          {mediaItems.length > 1 && (
            <div className={styles.carouselThumbStrip}>
              {mediaItems.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.carouselThumbButton} ${
                    index === activeMediaIndex
                      ? styles.carouselThumbButtonActive
                      : ""
                  }`}
                  onClick={() => setActiveMediaIndex(index)}
                  aria-label={`Show ${item.title}`}
                >
                  <img
                    className={styles.carouselThumbImage}
                    src={item.thumb}
                    alt={item.title}
                  />
                  {item.kind === "movie" && (
                    <span
                      className={styles.carouselThumbPlayButton}
                      aria-hidden="true"
                    >
                      <span className={styles.carouselThumbPlayIcon}>▶</span>
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </RevealWrapper>
    </div>
  );
};

export default ScreenshotsBlock;
