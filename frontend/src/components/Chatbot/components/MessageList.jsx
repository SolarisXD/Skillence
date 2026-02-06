import React from "react";
import { Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatTimestamp } from "../utils/helpers";
import styles from "../../../styles/chatbot/components.module.css";

const MessageList = ({ messages, onSpeak, isPlaying }) => {
  const navigate = useNavigate();

  // Map of path patterns to friendly names for link display
  const pathNames = {
    "/dashboard/resume": "Resume Dashboard",
    "/profile": "My Profile",
    "/career-path-recommendation": "Career Path Recommendation",
    "/job-trends": "Job Trends Dashboard",
    "/job-offer-evaluator": "Job Offer Evaluator",
    "/": "Home Page",
  };

  // Function to detect and convert paths to clickable links
  const renderTextWithLinks = (text) => {
    // Regex to match paths like /dashboard/resume, /profile, etc.
    const pathRegex = /(\/[a-z0-9\-\/]+)/gi;
    const parts = text.split(pathRegex);

    return parts.map((part, index) => {
      // Check if this part is a valid internal path
      const isPath =
        part.startsWith("/") &&
        Object.keys(pathNames).some(
          (path) =>
            part === path ||
            part.startsWith(path + " ") ||
            part.startsWith(path + ",") ||
            part.startsWith(path + "."),
        );

      // Find the matching path
      const matchedPath = Object.keys(pathNames).find((path) =>
        part.startsWith(path),
      );

      if (isPath && matchedPath) {
        // Extract the actual path and any trailing text
        const trailingText = part.slice(matchedPath.length);

        return (
          <React.Fragment key={index}>
            <button
              onClick={() => navigate(matchedPath)}
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                color: "white",
                padding: "4px 10px",
                borderRadius: "6px",
                border: "none",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "500",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                margin: "2px 4px",
                boxShadow: "0 2px 4px rgba(59, 130, 246, 0.3)",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "scale(1.02)";
                e.target.style.boxShadow = "0 4px 8px rgba(59, 130, 246, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 2px 4px rgba(59, 130, 246, 0.3)";
              }}
            >
              🔗 {pathNames[matchedPath]}
            </button>
            {trailingText}
          </React.Fragment>
        );
      }
      return part;
    });
  };

  if (!messages || messages.length === 0) {
    return (
      <div className={styles.skillenceMessage}>
        <p>Start a conversation with Skillence!</p>
      </div>
    );
  }

  const formatMessageContent = (content) => {
    // Split content into lines and format them properly
    const lines = content.split("\n");
    const elements = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (line === "") {
        elements.push(<br key={`br-${i}`} />);
        continue;
      }

      if (line.startsWith("•")) {
        // Handle bullet points with link support
        const bulletContent = line.substring(1).trim();
        elements.push(
          <div
            key={`bullet-${i}`}
            style={{
              margin: "6px 0",
              paddingLeft: "16px",
              position: "relative",
              textAlign: "left",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: "0",
                color: "#1e40af",
                fontWeight: "600",
              }}
            >
              •
            </span>
            {renderTextWithLinks(bulletContent)}
          </div>,
        );
      } else if (line.startsWith("✨") || line.startsWith("👋")) {
        // Handle emoji lines with spacing
        elements.push(
          <div
            key={`emoji-${i}`}
            style={{
              margin: "12px 0",
              fontWeight: "500",
              textAlign: "left",
            }}
          >
            {renderTextWithLinks(line)}
          </div>,
        );
      } else {
        // Handle regular text with link support
        elements.push(
          <div
            key={`text-${i}`}
            style={{
              margin: "8px 0",
              textAlign: "left",
            }}
          >
            {renderTextWithLinks(line)}
          </div>,
        );
      }
    }

    return elements;
  };

  return (
    <div className={styles.skillenceMessages}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`${styles.skillenceMessage} ${
            message.type === "user"
              ? styles.skillenceMessageUser
              : styles.skillenceMessageBot
          }`}
        >
          <div
            className={`${styles.skillenceMessageBubble} ${
              message.type === "user"
                ? styles.skillenceMessageBubbleUser
                : styles.skillenceMessageBubbleBot
            }`}
          >
            {message.type === "bot"
              ? formatMessageContent(message.content)
              : message.content}
            {message.type === "bot" && onSpeak && (
              <button
                onClick={() => onSpeak(message.content)}
                className={styles.skillenceSpeakButton}
                disabled={isPlaying}
                aria-label="Read message aloud"
              >
                <Volume2 size={14} />
              </button>
            )}
          </div>
          <div className={styles.skillenceMessageTimestamp}>
            {formatTimestamp(message.timestamp)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageList;
