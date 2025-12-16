import React, { useState, useEffect, useRef } from "react";

/**
 * OptimizedImage component with lazy loading, responsive sizing, and error handling
 * Similar to Next.js Image component
 *
 * @param {string} src - Image source URL
 * @param {string} alt - Alt text for accessibility
 * @param {number} width - Image width (optional, for aspect ratio)
 * @param {number} height - Image height (optional, for aspect ratio)
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 * @param {boolean} priority - If true, load immediately without lazy loading
 * @param {string} placeholder - Placeholder image URL or "blur" for blur placeholder
 * @param {string} objectFit - CSS object-fit value (cover, contain, etc.)
 * @param {string} objectPosition - CSS object-position value
 * @param {function} onLoad - Callback when image loads
 * @param {function} onError - Callback when image fails to load
 * @param {string} sizes - Responsive sizes attribute for srcset
 * @param {object} srcSet - Object with breakpoints and image URLs for responsive images
 */
const OptimizedImage = ({
  src,
  alt = "",
  width,
  height,
  className = "",
  style = {},
  priority = false,
  placeholder = "blur",
  objectFit = "cover",
  objectPosition = "center",
  onLoad,
  onError,
  sizes,
  srcSet,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(
    placeholder === "blur" ? undefined : placeholder
  );
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate srcset string from srcSet object
  const generateSrcSet = () => {
    if (!srcSet || typeof srcSet !== "object") return undefined;
    return Object.entries(srcSet)
      .map(([breakpoint, url]) => `${url} ${breakpoint}w`)
      .join(", ");
  };

  // Load image when it comes into view (lazy loading)
  useEffect(() => {
    if (priority || !src) {
      // Load immediately if priority or no src
      setImageSrc(src);
      return;
    }

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === "undefined") {
      // Fallback: load immediately
      setImageSrc(src);
      return;
    }

    // Setup observer after a small delay to ensure container is mounted
    let currentContainerRef = null;
    const timeoutId = setTimeout(() => {
      currentContainerRef = containerRef.current;

      if (!currentContainerRef) {
        // If container still not available, load immediately
        setImageSrc(src);
        return;
      }

      // If container is already visible, load immediately
      const rect = currentContainerRef.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight + 50 && rect.bottom > -50;
      if (isVisible) {
        setImageSrc(src);
        return;
      }

      // Create IntersectionObserver for lazy loading
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setImageSrc(src);
              if (observerRef.current && currentContainerRef) {
                observerRef.current.unobserve(currentContainerRef);
              }
            }
          });
        },
        {
          rootMargin: "50px", // Start loading 50px before image enters viewport
          threshold: 0.01,
        }
      );

      // Observe the container element
      observerRef.current.observe(currentContainerRef);
    }, 0);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      if (observerRef.current && currentContainerRef) {
        observerRef.current.unobserve(currentContainerRef);
      }
    };
  }, [src, priority]);

  // Handle image load
  const handleLoad = (e) => {
    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  // Handle image error
  const handleError = (e) => {
    setHasError(true);
    setIsLoaded(false);
    if (onError) {
      onError(e);
    }
  };

  // Calculate aspect ratio if width and height are provided
  const aspectRatio = width && height ? (height / width) * 100 : null;
  const paddingBottom = aspectRatio ? `${aspectRatio}%` : undefined;

  // Container styles
  const containerStyle = {
    position: "relative",
    width: width ? `${width}px` : "100%",
    height: height && !aspectRatio ? `${height}px` : undefined,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    ...style,
  };

  // Image styles
  const imageStyle = {
    position: aspectRatio ? "absolute" : "relative",
    top: 0,
    left: 0,
    width: "100%",
    height: aspectRatio ? "100%" : "auto",
    objectFit,
    objectPosition,
    transition: "opacity 0.3s ease-in-out",
    opacity: isLoaded ? 1 : 0,
  };

  // Placeholder/loading skeleton
  const skeletonStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "#e5e7eb",
    backgroundImage:
      placeholder === "blur"
        ? "linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 50%, #e5e7eb 100%)"
        : undefined,
    backgroundSize: placeholder === "blur" ? "200% 100%" : undefined,
    animation: placeholder === "blur" ? "shimmer 1.5s infinite" : undefined,
    opacity: isLoaded ? 0 : 1,
    transition: "opacity 0.3s ease-in-out",
  };

  // Error placeholder
  const errorPlaceholder = (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f3f4f6",
        color: "#9ca3af",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  return (
    <div ref={containerRef} style={containerStyle} className={className}>
      {/* Aspect ratio container */}
      {aspectRatio && (
        <div
          style={{
            width: "100%",
            paddingBottom,
          }}
        />
      )}

      {/* Loading skeleton/placeholder */}
      {!isLoaded && !hasError && (
        <div style={skeletonStyle}>
          {placeholder && placeholder !== "blur" && (
            <img
              src={placeholder}
              alt=""
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
        </div>
      )}

      {/* Error placeholder */}
      {hasError && errorPlaceholder}

      {/* Actual image */}
      {imageSrc && !hasError && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          srcSet={generateSrcSet()}
          sizes={sizes}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          {...props}
        />
      )}

      {/* Shimmer animation for blur placeholder */}
      {placeholder === "blur" && (
        <style>
          {`
            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
          `}
        </style>
      )}
    </div>
  );
};

export default OptimizedImage;
