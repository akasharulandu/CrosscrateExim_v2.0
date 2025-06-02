import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Notifications.css";
import { FaEnvelopeOpen, FaEnvelope, FaTrash } from "react-icons/fa";
import { Modal } from "react-bootstrap";

function Notifications({ theme, onUnreadCountChange }) {
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("all");

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
      setMessages([]); // clear on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Calculate unread count and notify parent (e.g., Navbar)
  useEffect(() => {
    const unreadCount = messages.filter((msg) => !msg.read).length;
    if (onUnreadCountChange) onUnreadCountChange(unreadCount);
  }, [messages, onUnreadCountChange]);

  const handleReplyChange = (id, value) => {
    setReplyText((prev) => ({ ...prev, [id]: value }));
  };

  const handleReplySubmit = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token for reply");

      if (!replyText[id] || replyText[id].trim() === "") {
        alert("Reply text cannot be empty");
        return;
      }

      const reply = replyText[id].trim();

      const res = await axios.put(
        `/api/messages/${id}/reply`,
        { reply },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (res.status === 200) {
        alert("Replied successfully");

        // Optimistically update local message state so reply shows immediately
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg._id === id ? { ...msg, reply: reply, read: true } : msg
          )
        );

        // Clear the reply text box for this message
        setReplyText((prev) => ({ ...prev, [id]: "" }));

        // Optionally re-fetch messages for full sync, but not mandatory
        // await fetchMessages();
      } else {
        alert("Failed to reply");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to reply");
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
        alert("Deleted successfully");
        await fetchMessages();
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  // Mark as read when opening a message
  const handleOpenMessage = async (msg) => {
    setSelectedMsg(msg);
    setShowModal(true);

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
        // handle error
      }
    }
  };

  // Filter messages based on filter state
  const filteredMessages = messages.filter(msg => {
    if (filter === "all") return true;
    if (filter === "unread") return !msg.read;
    if (filter === "read") return msg.read;
    return true;
  });

  if (loading) return <div className={`container mt-5 ${themeClass}`}>Loading messages...</div>;

  return (
    <div className={`notifications-container container mt-5 ${themeClass}`}>
      <h2 className="notifications-title mb-4">Customer Messages</h2>

      {/* Filter Buttons */}
      <div className="notification-filters mb-4">
        <button
          className={`notif-filter-btn${filter === "all" ? " active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All
        </button>
        <button
          className={`notif-filter-btn${filter === "unread" ? " active" : ""}`}
          onClick={() => setFilter("unread")}
        >
          Unread
        </button>
        <button
          className={`notif-filter-btn${filter === "read" ? " active" : ""}`}
          onClick={() => setFilter("read")}
        >
          Read
        </button>
      </div>

      {filteredMessages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <div className="notification-list">
          {filteredMessages.map((msg) => (
            <div
              key={msg._id}
              className={`notification-row ${msg.read ? "read" : "unread"}`}
            >
              <div
                className="icon"
                onClick={() => handleOpenMessage(msg)}
                style={{ cursor: "pointer" }}
              >
                {msg.read ? <FaEnvelopeOpen /> : <FaEnvelope />}
              </div>
              <div
                className="info"
                onClick={() => handleOpenMessage(msg)}
                style={{ cursor: "pointer" }}
              >
                <div className="sender">{msg.name} <span className="email">({msg.email})</span></div>
                <div className="snippet">{msg.message.slice(0, 40)}{msg.message.length > 40 ? "..." : ""}</div>
              </div>
              <div className="date" onClick={() => handleOpenMessage(msg)} style={{ cursor: "pointer" }}>
                {new Date(msg.createdAt).toLocaleString()}
              </div>
              <button
                className="notif-delete-btn"
                title="Delete message"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(msg._id);
                }}
              >
                <FaTrash style={{ color: "#e53935" }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal for full message */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedMsg?.name} <span className="text-muted">({selectedMsg?.email})</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-2"><strong>Received:</strong> {selectedMsg && new Date(selectedMsg.createdAt).toLocaleString()}</div>
          <div className="mb-3"><strong>Message:</strong><br />{selectedMsg?.message}</div>
          {selectedMsg?.reply && (
            <div className="alert alert-info">
              <strong>Reply:</strong> {selectedMsg.reply}
            </div>
          )}
          <div className="d-flex justify-content-end mt-4">
            <button
              className="notif-delete-btn notif-delete-btn-modal"
              onClick={() => {
                setShowModal(false);
                handleDelete(selectedMsg._id);
              }}
              title="Delete message"
            >
              <FaTrash style={{ color: "#e53935" }} />
            </button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Notifications;
