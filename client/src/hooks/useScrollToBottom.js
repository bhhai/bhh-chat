import { useRef, useState, useCallback } from "react";

const SCROLL_THRESHOLD = -100;

export const useScrollToBottom = (
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage
) => {
  const messagesContainerRef = useRef();
  const hasTriggeredLoadMore = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      // With flex-col, bottom is at scrollHeight
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // With flex-col:
    // - scrollTop + clientHeight === scrollHeight means at bottom (newest messages)
    // - distanceFromBottom > threshold means scrolled up (away from bottom)
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Show button when scrolled away from bottom (more than threshold)
    setShowScrollButton(distanceFromBottom > Math.abs(SCROLL_THRESHOLD));

    if (!hasNextPage || isFetchingNextPage || isLoadingMore) {
      return;
    }

    // Check if scrolled to top (to load older messages)
    // With flex-col, top is at scrollTop === 0
    const isAtTop = scrollTop === 0;

    if (isAtTop && !hasTriggeredLoadMore.current) {
      hasTriggeredLoadMore.current = true;
      setIsLoadingMore(true);
      fetchNextPage()
        .then(() => {
          setTimeout(() => {
            hasTriggeredLoadMore.current = false;
            setIsLoadingMore(false);
          }, 300);
        })
        .catch(() => {
          hasTriggeredLoadMore.current = false;
          setIsLoadingMore(false);
        });
    } else if (!isAtTop) {
      hasTriggeredLoadMore.current = false;
      setIsLoadingMore(false);
    }
  }, [hasNextPage, isFetchingNextPage, isLoadingMore, fetchNextPage]);

  // Reset when user changes
  const reset = useCallback(() => {
    hasTriggeredLoadMore.current = false;
    setIsLoadingMore(false);
    setShowScrollButton(false);
  }, []);

  return {
    messagesContainerRef,
    scrollToBottom,
    handleScroll,
    showScrollButton,
    isLoadingMore,
    reset,
  };
};
