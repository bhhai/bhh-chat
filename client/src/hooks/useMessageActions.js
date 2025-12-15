import { useState, useCallback } from "react";
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

export const useMessageActions = () => {
  const { deleteMessage, getMessageDetail } = useContext(ChatContext);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [selectedMessageDetail, setSelectedMessageDetail] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuMsg, setMobileMenuMsg] = useState(null);

  const handleDeleteClick = useCallback((msg) => {
    setMessageToDelete(msg);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (messageToDelete) {
      await deleteMessage(messageToDelete._id);
      setShowDeleteModal(false);
      setMessageToDelete(null);
    }
  }, [messageToDelete, deleteMessage]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setMessageToDelete(null);
  }, []);

  const handleMessageClick = useCallback(
    async (messageId) => {
      const detail = await getMessageDetail(messageId);
      if (detail) {
        setSelectedMessageDetail(detail);
      }
    },
    [getMessageDetail]
  );

  return {
    showDeleteModal,
    messageToDelete,
    selectedMessageDetail,
    showDropdown,
    showMobileMenu,
    mobileMenuMsg,
    setShowDeleteModal,
    setSelectedMessageDetail,
    setShowDropdown,
    setShowMobileMenu,
    setMobileMenuMsg,
    handleDeleteClick,
    handleConfirmDelete,
    handleCancelDelete,
    handleMessageClick,
  };
};

