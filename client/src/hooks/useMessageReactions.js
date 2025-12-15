import { useState, useCallback } from "react";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";
import { AuthContext } from "../context/AuthContext";

export const useMessageReactions = () => {
  const { toggleReaction } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [hoveredReaction, setHoveredReaction] = useState(null);

  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

  const handleReactionClick = useCallback(
    async (messageId, emoji) => {
      await toggleReaction(messageId, emoji);
      setShowReactionPicker(null);
    },
    [toggleReaction]
  );

  const groupReactions = useCallback((reactions) => {
    if (!reactions || reactions.length === 0) return [];
    const grouped = {};
    reactions.forEach((reaction) => {
      if (!grouped[reaction.emoji]) {
        grouped[reaction.emoji] = [];
      }
      grouped[reaction.emoji].push(reaction);
    });
    return Object.entries(grouped).map(([emoji, users]) => ({
      emoji,
      users,
      count: users.length,
    }));
  }, []);

  return {
    showReactionPicker,
    setShowReactionPicker,
    hoveredReaction,
    setHoveredReaction,
    quickReactions,
    handleReactionClick,
    groupReactions,
  };
};

