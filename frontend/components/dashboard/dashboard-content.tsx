"use client";

import { UserChatBox } from "./user-chatbox";
import { ResponseChatBox } from "./response-chatbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserInput from "./user-input";
import { useChatStore } from "@/store/useChatStore";
import { useEffect, useRef } from "react";
import { ResponseChatBoxSkeleton } from "../skeletons";

const DashboardContent = () => {
  const { messages, isLoading } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  return (
    <div className="h-full flex flex-col bg-gray-100 rounded-xl">
      <ScrollArea className="max-h-140 flex-1 p-4 border ">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <p className="text-gray-500 text-base font-medium">
                No messages yet
              </p>
              <p className="text-gray-400 text-xs mt-1">
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
          {isLoading && <ResponseChatBoxSkeleton />}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      <div className="p-3">
        <UserInput />
      </div>
    </div>
  );
};

export default DashboardContent;
