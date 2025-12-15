import { useMemo } from "react";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const BACKGROUNDS = {
  "gradient-indigo-blue": "bg-gradient-to-br from-indigo-50 to-blue-50",
  "gradient-purple-pink": "bg-gradient-to-br from-purple-50 to-pink-50",
  "gradient-green-blue": "bg-gradient-to-br from-green-50 to-blue-50",
  "gradient-orange-red": "bg-gradient-to-br from-orange-50 to-red-50",
  "gradient-yellow-orange": "bg-gradient-to-br from-yellow-50 to-orange-50",
  "solid-white": "bg-white",
  "solid-gray": "bg-gray-50",
  "solid-blue": "bg-blue-50",
};

const getBackgroundClass = (backgroundId) => {
  return BACKGROUNDS[backgroundId] || BACKGROUNDS["gradient-indigo-blue"];
};

const getConversationTheme = (selectedUser, authUser) => {
  if (!selectedUser || !authUser?.chatThemes) {
    return "gradient-indigo-blue";
  }
  const themes = authUser.chatThemes;
  if (themes instanceof Map) {
    return themes.get(selectedUser._id) || "gradient-indigo-blue";
  } else if (typeof themes === "object" && themes !== null) {
    return themes[selectedUser._id] || "gradient-indigo-blue";
  }
  return "gradient-indigo-blue";
};

export const useChatBackground = (selectedUser) => {
  const { authUser } = useContext(AuthContext);

  return useMemo(() => {
    const chatBackground = getConversationTheme(selectedUser, authUser);
    const isImageBackground = chatBackground?.startsWith("http");
    const chatBackgroundClass = isImageBackground
      ? ""
      : getBackgroundClass(chatBackground);
    const chatBackgroundStyle = isImageBackground
      ? {
          backgroundImage: `url(${chatBackground})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }
      : {};

    return {
      chatBackgroundClass,
      chatBackgroundStyle,
    };
  }, [selectedUser, authUser]);
};

