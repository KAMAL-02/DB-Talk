import { create } from "zustand";

interface ExecutionResult {
  success: boolean;
  data: any[];
  rowCount: number;
  executionTime: number;
}

interface ResponseData {
  sql: string;
  explanation: string;
  executionResult: ExecutionResult;
}

interface ChatMessage {
  id: string;
  type: "user" | "system";
  content: string; // for user messages
  data?: ResponseData; // for system responses
  timestamp: string;
}

interface ChatStore {
  messages: ChatMessage[];
  isLoading: boolean;
  addUserMessage: (content: string) => void;
  addSystemResponse: (data: ResponseData) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  messages: [],
// messages: [
//   {
//     id: "1",
//     type: "user",
//     content: "Show me all users from the users table",
//     timestamp: "10:01",
//   },
//   {
//     id: "2",
//     type: "system",
//     content: "",
//     data: {
//       sql: "SELECT * FROM users;",
//       explanation: "This query retrieves all records from the users table.",
//       executionResult: {
//         success: true,
//         data: [
//           { id: 1, name: "Alice", email: "alice@test.com", ids: 1, names: "Alice", emails: "alice@test.com", idss: 1, namess: "Alice", emailss: "alice@test.com",idsss: 1, namesss: "Alice", emailsss: "alice@test.com", idssss: 1, namesssss: "Alice", emailssss: "alice@test.com", idsssss: 1, namessssss: "Alice", emailsssss: "alice@test.com" },
//           { id: 2, name: "Bob", email: "bob@test.com", ids: 1, names: "Alice", emails: "alice@test.com", idss: 1, namess: "Alice", emailss: "alice@test.com" },
//         ],
//         rowCount: 2,
//         executionTime: 12,
//       },
//     },
//     timestamp: "10:01",
//   },
//   {
//     id: "3",
//     type: "user",
//     content: "Give me orders placed today",
//     timestamp: "10:02",
//   },
//   {
//     id: "4",
//     type: "system",
//     content: "",
//     data: {
//       sql: "SELECT * FROM orders WHERE created_at::date = CURRENT_DATE;",
//       explanation: "This query fetches all orders created today.",
//       executionResult: {
//         success: true,
//         data: new Array(10).fill(null).map((_, i) => ({
//           id: i + 1,
//           amount: 100 + i * 10,
//         })),
//         rowCount: 10,
//         executionTime: 18,
//       },
//     },
//     timestamp: "10:02",
//   },
//   {
//     id: "5",
//     type: "user",
//     content: "How many users signed up this week?",
//     timestamp: "10:03",
//   },
//   {
//     id: "6",
//     type: "system",
//     content: "",
//     data: {
//       sql: "SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '7 days';",
//       explanation: "Counts users created in the last 7 days. Counts users created in the last 7 days. Counts users created in the last 7 days. Counts users created in the last 7 days.Counts users created in the last 7 days.",
//       executionResult: {
//         success: true,
//         data: [{ count: 42 }],
//         rowCount: 1,
//         executionTime: 9,
//       },
//     },
//     timestamp: "10:03",
//   },
// ],

  isLoading: false,

  
  addUserMessage: (content: string) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          type: "user",
          content,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    })),

  addSystemResponse: (data: ResponseData) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: Date.now().toString(),
          type: "system",
          content: "",
          data,
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    })),

  setLoading: (loading: boolean) => set({ isLoading: loading }),

  clearMessages: () => set({ messages: [] }),
}));
