"use client";

import { useState } from "react";
import { Input } from "../ui/input";
import { FiSend } from "react-icons/fi";
import { Button } from "../ui/button";
import useApi from "@/hooks/useApi";
import { ask } from "@/lib/api";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import { useChatStore } from "@/store/useChatStore";
import { notifyError } from "@/lib/utils";
import { Spinner } from "../ui/spinner";

const UserInput = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const { handleRequest: callAsk } = useApi(ask);
  const { connectedDatabase } = useDatabaseStore();
  const { addUserMessage, addSystemResponse } = useChatStore();

  const handleSend = async() => {
    if (!text.trim() || loading) return;
    try {
        setLoading(true);
        const databaseId = connectedDatabase?.databaseId;
        if (!databaseId) throw new Error("No database connected.");
        const userMessage = text.trim();
        setText("");    
        addUserMessage(userMessage);
        const payload = {
            databaseId,
            message: userMessage,
        }
        const response = await callAsk(payload);
        console.log("Response from ask API:", response);
        if (response.data?.data) {
          addSystemResponse(response.data.data);
        }
    } catch (error) {
        console.log("Error sending user input:", error);
        notifyError(error, "Error retrieving response from the server.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
          }
        }}
        placeholder="Type your message..."
        disabled={loading}
        className="h-11 flex-1 border border-gray-400 text-black disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <Button
        onClick={handleSend}
        disabled={!text.trim() || loading}
        className="h-11 w-11 bg-orange-400 hover:bg-orange-500 text-white p-0 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? <Spinner className="h-6 w-6" /> : <FiSend className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default UserInput;
