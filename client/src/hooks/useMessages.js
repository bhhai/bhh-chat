import { useInfiniteQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useMessages = (userId) => {
  const { axios, authUser } = useContext(AuthContext);

  return useInfiniteQuery({
    queryKey: ["messages", userId],
    queryFn: async ({ pageParam = 1 }) => {
      if (!userId || !authUser) {
        return { messages: [], hasMore: false };
      }

      const { data } = await axios.get(`/api/messages/${userId}`, {
        params: { page: pageParam, limit: 50 },
      });

      if (data.success) {
        // Messages are already sorted by createdAt descending from backend
        const sortedMessages = data.messages.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        return {
          messages: sortedMessages,
          hasMore: data.hasMore,
          page: data.page,
          total: data.total,
        };
      }
      return { messages: [], hasMore: false };
    },
    getNextPageParam: (lastPage) => {
      // Return next page number if there are more pages, otherwise undefined
      return lastPage.hasMore ? lastPage.page + 1 : undefined;
    },
    enabled: !!userId && !!authUser,
    staleTime: 0, // Always consider data stale to allow refetching when switching chats
    refetchOnWindowFocus: false, // Don't refetch on window focus
    refetchOnMount: false, // Don't auto-refetch on mount - we'll manually refetch when selectedUser changes
    // React Query automatically keeps previous data for infinite queries
  });
};
