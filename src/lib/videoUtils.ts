/**
 * Utility functions for handling video URLs from different platforms
 */

export interface VideoPlatform {
  name: string;
  embedUrl: string;
  thumbnailUrl?: string;
}

export interface ParsedVideoUrl {
  platform: VideoPlatform;
  videoId: string;
  originalUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
}

/**
 * Detect video platform from URL
 */
export function detectVideoPlatform(url: string): VideoPlatform | null {
  const cleanUrl = url.trim().toLowerCase();

  // YouTube patterns
  if (cleanUrl.includes('youtube.com') || cleanUrl.includes('youtu.be')) {
    return {
      name: 'YouTube',
      embedUrl: 'https://www.youtube.com/embed/',
      thumbnailUrl: 'https://img.youtube.com/vi/{videoId}/maxresdefault.jpg'
    };
  }

  // Vimeo patterns
  if (cleanUrl.includes('vimeo.com')) {
    return {
      name: 'Vimeo',
      embedUrl: 'https://player.vimeo.com/video/',
      thumbnailUrl: 'https://vumbnail.com/{videoId}.jpg'
    };
  }

  // Gumlet patterns (assuming standard video hosting)
  if (cleanUrl.includes('gumlet.com') || cleanUrl.includes('gumlet.tv')) {
    return {
      name: 'Gumlet',
      embedUrl: '', // Gumlet typically uses direct video URLs
      thumbnailUrl: '' // Will need to be provided manually
    };
  }

  return null;
}

/**
 * Extract video ID from URL
 */
export function extractVideoId(url: string, platform: VideoPlatform): string | null {
  const cleanUrl = url.trim();

  switch (platform.name) {
    case 'YouTube':
      // Handle youtu.be short links
      if (cleanUrl.includes('youtu.be/')) {
        const match = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
        return match ? match[1].split('?')[0] : null;
      }
      // Handle youtube.com links
      if (cleanUrl.includes('youtube.com/watch')) {
        const match = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
      }
      // Handle youtube.com/embed links
      if (cleanUrl.includes('youtube.com/embed/')) {
        const match = cleanUrl.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
        return match ? match[1] : null;
      }
      break;

    case 'Vimeo':
      const vimeoMatch = cleanUrl.match(/vimeo\.com\/(\d+)/);
      return vimeoMatch ? vimeoMatch[1] : null;

    case 'Gumlet':
      // For Gumlet, we'll use the full URL as the video ID since it's typically a direct video URL
      return cleanUrl;
  }

  return null;
}

/**
 * Parse video URL and return structured data
 */
export function parseVideoUrl(url: string): ParsedVideoUrl | null {
  const platform = detectVideoPlatform(url);
  if (!platform) return null;

  const videoId = extractVideoId(url, platform);
  if (!videoId) return null;

  let embedUrl = '';
  let thumbnailUrl = '';

  switch (platform.name) {
    case 'YouTube':
      embedUrl = `${platform.embedUrl}${videoId}`;
      thumbnailUrl = platform.thumbnailUrl?.replace('{videoId}', videoId) || '';
      break;

    case 'Vimeo':
      embedUrl = `${platform.embedUrl}${videoId}`;
      thumbnailUrl = platform.thumbnailUrl?.replace('{videoId}', videoId) || '';
      break;

    case 'Gumlet':
      // For Gumlet, use direct video URL
      embedUrl = url;
      thumbnailUrl = ''; // Will need to be provided manually
      break;
  }

  return {
    platform,
    videoId,
    originalUrl: url,
    embedUrl,
    thumbnailUrl
  };
}

/**
 * Generate thumbnail URL for a video
 */
export function generateThumbnailUrl(url: string): string {
  const parsed = parseVideoUrl(url);
  if (parsed && parsed.thumbnailUrl) {
    return parsed.thumbnailUrl;
  }

  // Fallback: return original URL (will be handled by VideoManager)
  return url;
}

/**
 * Check if URL is a supported video platform
 */
export function isSupportedVideoUrl(url: string): boolean {
  return detectVideoPlatform(url) !== null;
}

/**
 * Get embed URL for video
 */
export function getEmbedUrl(url: string): string {
  const parsed = parseVideoUrl(url);
  return parsed ? parsed.embedUrl : url;
}

/**
 * Validate video URL
 */
export function validateVideoUrl(url: string): { isValid: boolean; platform?: string; error?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  const cleanUrl = url.trim();

  // Check if it's a valid URL format
  try {
    new URL(cleanUrl);
  } catch {
    return { isValid: false, error: 'Invalid URL format' };
  }

  const platform = detectVideoPlatform(cleanUrl);
  if (!platform) {
    return { isValid: false, error: 'Unsupported video platform. Supported: YouTube, Vimeo, Gumlet' };
  }

  const videoId = extractVideoId(cleanUrl, platform);
  if (!videoId) {
    return { isValid: false, error: 'Could not extract video ID from URL' };
  }

  return { isValid: true, platform: platform.name };
}