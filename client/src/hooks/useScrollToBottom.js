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
      // With flex-col-reverse, bottom is at top: 0
      messagesContainerRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;

    // With flex-col-reverse:
    // - scrollTop === 0 means at bottom (newest messages)
    // - scrollTop > threshold means scrolled up (away from bottom)
    const distanceFromBottom = scrollTop;

    // Show button when scrolled away from bottom (more than threshold)
    setShowScrollButton(distanceFromBottom > Math.abs(SCROLL_THRESHOLD));

    if (!hasNextPage || isFetchingNextPage || isLoadingMore) {
      return;
    }

    // Check if scrolled to top (to load older messages)
    // With flex-col-reverse, top is at scrollHeight - clientHeight
    const isAtTop = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold

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
