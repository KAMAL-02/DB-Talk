"use client";

interface UserInputProps {
  message: string;
  timestamp?: string;
}

export function UserChatBox({ message, timestamp }: UserInputProps) {
  return (
    <div className="flex items-start gap-3 mb-6 justify-end">
      <div className="flex flex-col gap-1 max-w-[70%]">
        <div className="relative bg-white border border-gray-200 rounded-lg rounded-br-none shadow-sm px-4 py-3">
          <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[12px] border-t-white border-l-[12px] border-l-transparent"></div>
          <div className="absolute bottom-0 right-0 w-0 h-0 border-t-[13px] border-t-gray-200 border-l-[13px] border-l-transparent -z-10"></div>
          
          <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap">
            {message}
          </p>
        </div>
        
        {timestamp && (
          <span className="text-xs text-gray-500 mr-2 text-right">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
