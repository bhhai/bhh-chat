/**
 * Example usage of Image component
 *
 * This file demonstrates various ways to use the Image component
 */

import OptimizedImage from "./Image";

// Example 1: Basic usage with lazy loading
export const BasicImage = () => {
  return (
    <OptimizedImage
      src="https://example.com/image.jpg"
      alt="Example image"
      width={800}
      height={600}
    />
  );
};

// Example 2: Responsive image with srcset
export const ResponsiveImage = () => {
  return (
    <OptimizedImage
      src="https://example.com/image.jpg"
      alt="Responsive image"
      srcSet={{
        320: "https://example.com/image-320w.jpg",
        640: "https://example.com/image-640w.jpg",
        1024: "https://example.com/image-1024w.jpg",
        1920: "https://example.com/image-1920w.jpg",
      }}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      width={1920}
      height={1080}
    />
  );
};

// Example 3: Image with custom placeholder
export const ImageWithPlaceholder = () => {
  return (
    <OptimizedImage
      src="https://example.com/image.jpg"
      alt="Image with placeholder"
      placeholder="https://example.com/placeholder.jpg"
      width={800}
      height={600}
    />
  );
};

// Example 4: Image with blur placeholder (default)
export const ImageWithBlur = () => {
  return (
    <OptimizedImage
      src="https://example.com/image.jpg"
      alt="Image with blur placeholder"
      placeholder="blur"
      width={800}
      height={600}
    />
  );
};

// Example 5: Priority image (loads immediately)
export const PriorityImage = () => {
  return (
    <OptimizedImage
      src="https://example.com/hero-image.jpg"
      alt="Hero image"
      priority
      width={1920}
      height={1080}
    />
  );
};

// Example 6: Image with custom styling
export const StyledImage = () => {
  return (
    <OptimizedImage
      src="https://example.com/image.jpg"
      alt="Styled image"
      width={800}
      height={600}
      className="rounded-lg shadow-lg"
      objectFit="contain"
      objectPosition="top"
      style={{ borderRadius: "12px" }}
    />
  );
};

// Example 7: Image with callbacks
export const ImageWithCallbacks = () => {
  return (
    <OptimizedImage
      src="https://example.com/image.jpg"
      alt="Image with callbacks"
      width={800}
      height={600}
      onLoad={(e) => {
        console.log("Image loaded:", e.target.src);
      }}
      onError={(e) => {
        console.error("Image failed to load:", e.target.src);
      }}
    />
  );
};

// Example 8: Full width responsive image
export const FullWidthImage = () => {
  return (
    <OptimizedImage
      src="https://example.com/image.jpg"
      alt="Full width image"
      className="w-full"
      objectFit="cover"
    />
  );
};

// Example 9: Avatar/Profile picture
export const AvatarImage = () => {
  return (
    <OptimizedImage
      src="https://example.com/avatar.jpg"
      alt="User avatar"
      width={100}
      height={100}
      className="rounded-full"
      objectFit="cover"
    />
  );
};

// Example 10: Chat message image
export const ChatMessageImage = () => {
  return (
    <OptimizedImage
      src="https://example.com/chat-image.jpg"
      alt="Chat image"
      className="max-w-[280px] rounded-lg"
      objectFit="cover"
      priority={false}
    />
  );
};
