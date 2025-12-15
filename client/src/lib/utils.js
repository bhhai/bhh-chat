export function formatMessageTime(date) {
  try {
    if (!date) return "";
    const messageDate = new Date(date);
    if (isNaN(messageDate.getTime())) return "";
    return messageDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    console.error("Error formatting message time:", error);
    return "";
  }
}

export function formatLastActive(lastActive) {
  try {
    if (!lastActive) return "Inactive";
    const lastActiveDate = new Date(lastActive);
    if (isNaN(lastActiveDate.getTime())) return "Inactive";

    const now = new Date();
    const diffInMs = now - lastActiveDate;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return "Recently active";
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return lastActiveDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    }
  } catch (error) {
    console.error("Error formatting last active:", error);
    return "Inactive";
  }
}
