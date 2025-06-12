import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaEnvelopeOpen, 
  FaEnvelope, 
  FaTrash, 
  FaSearch, 
  FaFilter, 
  FaReply, 
  FaTimes, 
  FaCheck 
} from "react-icons/fa";
import { Modal } from "react-bootstrap";

function Notifications({ theme, onUnreadCountChange }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // THEME CLASS
  const themeClass = theme === "dark" ? "dark-theme" : "light-theme";

  // Fetch messages from backend API
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const res = await fetch("/api/messages", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Error fetching messages: ${res.status} ${errorText}`);
      }

      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Fetch messages failed:", error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Calculate unread count and notify parent
  useEffect(() => {
    const unreadCount = messages.filter((msg) => !msg.read).length;
    if (onUnreadCountChange) onUnreadCountChange(unreadCount);
  }, [messages, onUnreadCountChange]);

  const handleReplySubmit = async () => {
    if (!selectedMsg || !replyContent.trim()) return;
    
    setIsReplying(true);
    
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token for reply");

      const res = await axios.put(
        `/api/messages/${selectedMsg._id}/reply`,
        { reply: replyContent.trim() },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        // Update local state
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === selectedMsg._id 
              ? { ...msg, reply: replyContent.trim(), read: true } 
              : msg
          )
        );
        
        setSelectedMsg(prev => ({ ...prev, reply: replyContent.trim(), read: true }));
        setReplyContent("");
        setShowReplyForm(false);
        
        // Show success message
        alert("Reply sent successfully!");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    } finally {
      setIsReplying(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token for delete");

      const res = await axios.delete(`/api/messages/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setMessages(prev => prev.filter(msg => msg._id !== id));
        if (selectedMsg && selectedMsg._id === id) {
          setShowModal(false);
          setSelectedMsg(null);
        }
        alert("Message deleted successfully");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete message");
    }
  };

  // Mark as read when opening a message
  const handleOpenMessage = async (msg) => {
    setSelectedMsg(msg);
    setShowModal(true);
    setShowReplyForm(false);
    setReplyContent("");

    if (!msg.read) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`/api/messages/${msg._id}/read`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages((prev) =>
          prev.map((m) => (m._id === msg._id ? { ...m, read: true } : m))
        );
      } catch (err) {
        console.error("Failed to mark as read:", err);
      }
    }
  };

  // Filter and search messages
  const filteredMessages = messages.filter(msg => {
    const matchesFilter = filter === "all" || 
                         (filter === "unread" && !msg.read) || 
                         (filter === "read" && msg.read);
    
    const matchesSearch = searchTerm === "" || 
                         msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className={`notifyx-loading ${themeClass}`}>
        <div className="notifyx-loading-spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className={`notifyx-container ${themeClass}`}>
      <motion.div 
        className="notifyx-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="notifyx-title">Customer Messages</h1>
        <p className="notifyx-subtitle">Manage and respond to customer inquiries</p>
      </motion.div>

      {/* Search and Filter Controls */}
      <motion.div 
        className="notifyx-controls"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="notifyx-search-container">
          <FaSearch className="notifyx-search-icon" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="notifyx-search-input"
          />
        </div>
        
        <div className="notifyx-filter-container">
          <FaFilter className="notifyx-filter-icon" />
          <div className="notifyx-filter-buttons">
            <button
              className={`notifyx-filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({messages.length})
            </button>
            <button
              className={`notifyx-filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({messages.filter(m => !m.read).length})
            </button>
            <button
              className={`notifyx-filter-btn ${filter === "read" ? "active" : ""}`}
              onClick={() => setFilter("read")}
            >
              Read ({messages.filter(m => m.read).length})
            </button>
          </div>
        </div>
      </motion.div>

      {/* Messages List */}
      <div className="notifyx-messages-container">
        {filteredMessages.length === 0 ? (
          <motion.div 
            className="notifyx-no-messages"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <FaEnvelope className="notifyx-no-messages-icon" />
            <h3>No messages found</h3>
            <p>
              {searchTerm ? "Try adjusting your search terms" : "No messages match the current filter"}
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {filteredMessages.map((msg, index) => (
              <motion.div
                key={msg._id}
                className={`notifyx-message-card ${msg.read ? "read" : "unread"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleOpenMessage(msg)}
                whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="notifyx-message-status">
                  {msg.read ? <FaEnvelopeOpen /> : <FaEnvelope />}
                </div>
                
                <div className="notifyx-message-content">
                  <div className="notifyx-message-header">
                    <h4 className="notifyx-sender-name">{msg.name}</h4>
                    <span className="notifyx-sender-email">{msg.email}</span>
                  </div>
                  
                  <p className="notifyx-message-preview">
                    {msg.message.length > 100 
                      ? `${msg.message.substring(0, 100)}...` 
                      : msg.message
                    }
                  </p>
                  
                  <div className="notifyx-message-meta">
                    <span className="notifyx-message-date">
                      {new Date(msg.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {msg.reply && (
                      <span className="notifyx-reply-indicator">
                        <FaReply /> Replied
                      </span>
                    )}
                  </div>
                </div>
                
                <button
                  className="notifyx-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(msg._id);
                  }}
                  title="Delete message"
                >
                  <FaTrash />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Message Detail Modal */}
      <Modal 
        show={showModal} 
        onHide={() => {
          setShowModal(false);
          setShowReplyForm(false);
          setReplyContent("");
        }} 
        centered 
        size="lg"
        className="notifyx-message-modal"
      >
        <Modal.Header closeButton className="notifyx-modal-header-custom">
          <Modal.Title>
            <div className="notifyx-modal-title-content">
              <div className="notifyx-sender-info">
                <h4>{selectedMsg?.name}</h4>
                <span>{selectedMsg?.email}</span>
              </div>
              <div className="notifyx-message-status-badge">
                {selectedMsg?.read ? (
                  <span className="notifyx-status-read">
                    <FaCheck /> Read
                  </span>
                ) : (
                  <span className="notifyx-status-unread">
                    <FaEnvelope /> Unread
                  </span>
                )}
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="notifyx-modal-body-custom">
          <div className="notifyx-message-details">
            <div className="notifyx-message-timestamp">
              <strong>Received:</strong> {selectedMsg && new Date(selectedMsg.createdAt).toLocaleString()}
            </div>
            
            <div className="notifyx-message-text">
              <h5>Message:</h5>
              <div className="notifyx-message-content-full">
                {selectedMsg?.message}
              </div>
            </div>
            
            {selectedMsg?.reply && (
              <div className="notifyx-existing-reply">
                <h5>Your Reply:</h5>
                <div className="notifyx-reply-content">
                  {selectedMsg.reply}
                </div>
              </div>
            )}
            
            {/* Reply Form */}
            <AnimatePresence>
              {showReplyForm && (
                <motion.div 
                  className="notifyx-reply-form"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h5>Send Reply:</h5>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Type your reply here..."
                    className="notifyx-reply-textarea"
                    rows="4"
                  />
                  <div className="notifyx-reply-actions">
                    <button 
                      className="notifyx-reply-send-btn"
                      onClick={handleReplySubmit}
                      disabled={!replyContent.trim() || isReplying}
                    >
                      {isReplying ? "Sending..." : "Send Reply"}
                    </button>
                    <button 
                      className="notifyx-reply-cancel-btn"
                      onClick={() => {
                        setShowReplyForm(false);
                        setReplyContent("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Modal.Body>
        
        <Modal.Footer className="notifyx-modal-footer-custom">
          <div className="notifyx-modal-actions">
            {!selectedMsg?.reply && !showReplyForm && (
              <button 
                className="notifyx-reply-btn"
                onClick={() => setShowReplyForm(true)}
              >
                <FaReply /> Reply
              </button>
            )}
            
            <button 
              className="notifyx-delete-btn-modal"
              onClick={() => {
                setShowModal(false);
                handleDelete(selectedMsg._id);
              }}
            >
              <FaTrash /> Delete
            </button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Notifications;