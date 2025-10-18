import React from 'react';
import { parseVideoUrl } from '@/lib/videoUtils';

interface VideoEmbedProps {
  url: string;
  title?: string;
  thumbnail?: string;
  className?: string;
  style?: React.CSSProperties;
  onPlay?: () => void;
}

export const VideoEmbed: React.FC<VideoEmbedProps> = ({
  url,
  title,
  thumbnail,
  className = '',
  style,
  onPlay
}) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const parsedVideo = parseVideoUrl(url);

  // If it's a supported platform, use iframe embed
  if (parsedVideo) {
    const { platform, embedUrl } = parsedVideo;

    switch (platform.name) {
      case 'YouTube':
        return (
          <iframe
            src={`${embedUrl}?autoplay=0&rel=0&modestbranding=1`}
            title={title || 'YouTube Video'}
            className={`w-full h-full ${className}`}
            style={style}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onLoad={onPlay}
          />
        );

      case 'Vimeo':
        return (
          <iframe
            src={`${embedUrl}?autoplay=0&color=ffffff&title=0&byline=0&portrait=0`}
            title={title || 'Vimeo Video'}
            className={`w-full h-full ${className}`}
            style={style}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            onLoad={onPlay}
          />
        );

      case 'Gumlet':
        // Try iframe embedding first with constructed embed URL
        const [iframeFailed, setIframeFailed] = React.useState(false);
        const [iframeLoaded, setIframeLoaded] = React.useState(false);

        // Set a timeout to detect if iframe fails to load
        React.useEffect(() => {
          if (!iframeLoaded && !iframeFailed) {
            const timer = setTimeout(() => {
              setIframeFailed(true);
            }, 3000); // 3 second timeout

            return () => clearTimeout(timer);
          }
        }, [iframeLoaded, iframeFailed]);

        if (!iframeFailed) {
          return (
            <iframe
              src={parsedVideo.embedUrl}
              title={title || 'Gumlet Video'}
              className={`w-full h-full ${className}`}
              style={style}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={() => {
                setIframeLoaded(true);
                onPlay?.();
              }}
              onError={() => setIframeFailed(true)}
            />
          );
        }

        // Fallback to modal approach if iframe fails
        return (
          <>
            {/* Thumbnail with play button */}
            <div
              className={`relative w-full h-full bg-black flex items-center justify-center cursor-pointer group ${className}`}
              style={style}
              onClick={() => setIsModalOpen(true)}
            >
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={title || 'Gumlet Video'}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                  <div className="text-white text-center">
                    <div className="text-4xl mb-2">🎥</div>
                    <div className="text-sm">Gumlet Video</div>
                  </div>
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300">
                <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                  <svg
                    className="w-8 h-8 text-black ml-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              {/* Click to play indicator */}
              <div className="absolute bottom-3 left-3 bg-black bg-opacity-70 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Click to play
              </div>
            </div>

            {/* Modal for video playback */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={() => setIsModalOpen(false)}>
                <div className="relative max-w-4xl max-h-screen p-4" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="absolute -top-12 right-0 text-white hover:text-gray-300 text-2xl"
                  >
                    ✕
                  </button>
                  <video
                    src={url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full"
                    onPlay={onPlay}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            )}
          </>
        );

      default:
        // Fallback to direct video
        return (
          <video
            src={url}
            poster={thumbnail}
            controls
            className={`w-full h-full object-cover object-center ${className}`}
            style={style}
            onPlay={onPlay}
          >
            Your browser does not support the video tag.
          </video>
        );
    }
  }

  // If not a recognized platform, try to render as direct video
  return (
    <video
      src={url}
      poster={thumbnail}
      controls
      className={`w-full h-full object-cover object-center ${className}`}
      style={style}
      onPlay={onPlay}
    >
      Your browser does not support the video tag.
    </video>
  );
};