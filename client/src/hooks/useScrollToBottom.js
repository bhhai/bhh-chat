import { useRef, useState, useCallback, useEffect } from "react";

const SCROLL_THRESHOLD = -100;

export const useScrollToBottom = (hasNextPage, isFetchingNextPage, fetchNextPage) => {
  const messagesContainerRef = useRef();
  const hasTriggeredLoadMore = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const scrollToBottom = useCallback(() => {
    if (messagesContainerRef.current) {
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

    // Show button when scrollTop < SCROLL_THRESHOLD (scrolled away from bottom)
    setShowScrollButton(scrollTop < SCROLL_THRESHOLD);

    if (!hasNextPage || isFetchingNextPage || isLoadingMore) {
      return;
    }

    const point = clientHeight - scrollHeight;
    const isAtTop = point === scrollTop;

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

