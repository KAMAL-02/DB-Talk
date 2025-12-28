"use client";

import { UserChatBox } from "./user-chatbox";
import { ResponseChatBox } from "./response-chatbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserInput from "./user-input";
import { useChatStore } from "@/store/useChatStore";
import { useEffect, useRef } from "react";

const DashboardContent = () => {
  const { messages } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="h-full flex flex-col bg-gray-100 rounded-xl">
      <ScrollArea className="max-h-160 flex-1 p-6 border">
        <div className="max-w-5xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <p className="text-gray-500 text-lg font-medium">
                No messages yet
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Start a conversation by typing a message below
              </p>
            </div>
          ) : (
            messages.map((message) => (
              message.type === "user" ? (
                <UserChatBox
                  key={message.id}
                  message={message.content}
                  timestamp={message.timestamp}
                />
              ) : (
                <ResponseChatBox
                  key={message.id}
                  data={message.data!}
                  timestamp={message.timestamp}
                />
              )
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="p-4">
        <UserInput />
      </div>
    </div>
  );
};

export default DashboardContent;
