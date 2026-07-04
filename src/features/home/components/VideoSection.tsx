import { useEffect, useRef, useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";

type VideoSectionProps = { fallbackImage: string };

const VideoSection = ({ fallbackImage }: VideoSectionProps) => {
  const { t } = useTranslation();
  const [videoError, setVideoError] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoReference = useRef<HTMLVideoElement>(null);
  const videoSource = "/videos/Morocco-Video.mp4";

  useEffect(() => {
    if (videoReference.current) videoReference.current.load();
  }, []);

  const handleVideoError = () => setVideoError(true);
  const handleVideoLoad = () => setVideoLoaded(true);

  const handlePlay = () => {
    if (!videoReference.current) {
      return;
    }

    void videoReference.current.play();
    setIsPlaying(true);
  };

  const handleVideoEnd = () => setIsPlaying(false);

  const handleVideoClick = () => {
    const video = videoReference.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section
      id="video"
      aria-label={t("video.sectionLabel", "Morocco Travel Video")}
      className="relative overflow-hidden py-4 text-white inline-full sm:py-6 lg:py-8"
    >
      <div className="mx-auto px-4 max-inline-330">
        <div
          data-animate="fade-up"
          className="relative overflow-hidden rounded-[34px] bg-zinc-900 p-3 shadow-2xl block-[55vh] inline-full sm:block-[65vh] lg:block-[75vh] xl:block-[85vh]"
        >
          {videoError ?
            <div
              className="flex items-center justify-center rounded-[26px] bg-cover bg-center px-8 py-12 text-center block-full"
              style={{ backgroundImage: `url(${fallbackImage})` }}
            >
              <div className="rounded-3xl bg-black/60 p-8">
                <h3 className="text-2xl font-semibold">{t("video.fallback.title")}</h3>
                <p className="mbs-3 text-sm text-white/80">{t("video.fallback.subtitle")}</p>
                <p className="mbs-4 text-xs tracking-[0.35em] text-orange-300 uppercase">
                  {t("video.fallback.cta")}
                </p>
              </div>
            </div>
          : <div className="relative size-full">
              {videoLoaded ? null : (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[26px] bg-zinc-950/60">
                  <div className="space-y-3 text-center">
                    <p className="text-sm tracking-[0.4em] text-orange-200 uppercase">
                      {t("video.loading")}
                    </p>
                    <div className="mx-auto size-10 animate-spin rounded-full border-2 border-white/20 border-t-white" />
                  </div>
                </div>
              )}
              <video
                ref={videoReference}
                loop
                muted
                playsInline
                onError={handleVideoError}
                onLoadedData={handleVideoLoad}
                onEnded={handleVideoEnd}
                onClick={handleVideoClick}
                preload="metadata"
                className={`size-full cursor-pointer rounded-[26px] object-cover transition-opacity duration-300 ${
                  videoLoaded ? "opacity-100" : "opacity-0"
                }`}
              >
                <source
                  src={videoSource}
                  type="video/mp4"
                />
                {t("video.unsupported")}
              </video>
              {videoLoaded && !isPlaying ?
                <button
                  type="button"
                  className="absolute inset-0 z-10 flex items-center justify-center rounded-[26px] bg-black/40 text-white transition pointer-fine:hover:bg-black/50"
                  onClick={handlePlay}
                  aria-label={t("video.playAria", "Play video")}
                >
                  <div className="flex size-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm transition-transform hover:scale-110">
                    <div className="ms-2 border-y-12 border-l-20 border-y-transparent border-l-white" />
                  </div>
                </button>
              : null}
            </div>
          }
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
