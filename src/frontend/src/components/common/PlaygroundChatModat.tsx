// src/frontend/src/components/common/PlaygroundChatModal.tsx
/*import React, { useState } from "react";
import { getMyBusinessProfile } from "../../services/business-profile";
import { BusinessProfile } from "../../types/business-profile";

const PlaygroundChatModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const apiUrl = process.env.REACT_APP_API_URL;
  const apiKey = process.env.REACT_APP_API_KEY;

  const handleSendMessage = async () => {
    setIsSending(true);
    try {
      const profile: BusinessProfile | null = await getMyBusinessProfile();
      const businessContext = profile
        ? {
            business_name: profile.business_name,
            industry: profile.industry,
            stage: profile.stage,
            current_challenges: profile.current_challenges,
            product_description: profile.product_description,
            target_market: profile.target_market,
            goals: [...(profile.short_term_goals || []), ...(profile.long_term_goals || [])],
          }
        : null;

      await fetch(`${apiUrl}/api/infoundr_agent`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey ?? "",
        },
        body: JSON.stringify({
          message: input,
          user_id: "dashboard",
          channel: "dashboard",
          businessContext,
        }),
      });

      setInput("");
    } catch (err) {
      console.error("Failed sending message:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div>
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
        className="w-full border p-2 rounded"
      />
      <div className="flex gap-2 mt-2">
        <button onClick={handleSendMessage} disabled={isSending} className="px-4 py-2 bg-blue-600 text-white rounded">
          {isSending ? "Sending..." : "Send"}
        </button>
        <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default PlaygroundChatModal;*/
import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import { getMyBusinessProfile } from "../../services/business-profile";

interface PlaygroundChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PlaygroundChatModal: React.FC<PlaygroundChatModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [profileContext, setProfileContext] = useState<string>("");

  useEffect(() => {
    (async () => {
      const profile = await getMyBusinessProfile();
      if (profile) {
        setProfileContext(
          `Business: ${profile.business_name}, Stage: ${profile.stage}, Industry: ${profile.industry}`
        );
      }
    })();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    setIsSending(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL;
      const apiKey = process.env.REACT_APP_API_KEY;

      const res = await fetch(`${apiUrl}/playground`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey || "",
        },
        body: JSON.stringify({ input, context: profileContext }),
      });

      const data = await res.json();
      setResponse(data.response || "No response");
    } catch (err) {
      console.error(err);
      setResponse("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-96 p-4">
        <h2 className="text-lg font-semibold mb-2">AI Playground</h2>
        <textarea
          className="border rounded w-full p-2 mb-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" onClick={handleSend} disabled={isSending}>
            {isSending ? "Sending..." : "Send"}
          </Button>
        </div>
        {response && (
          <div className="mt-4 p-2 border rounded bg-gray-50 text-gray-700">
            <strong>Response:</strong>
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaygroundChatModal;


