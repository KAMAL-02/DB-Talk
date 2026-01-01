import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FaInfoCircle } from "react-icons/fa";
import { IoIosInformationCircleOutline } from "react-icons/io";

const EffectiveQueryPopover = () => {
  const suggestion = [
    {
      title: "Use exact table and column names",
      desc: "Always reference tables and columns exactly as defined in the schema (including case and underscores).",
    },
    {
      title: "Mention the table explicitly when asking for data",
      desc: 'For example: "Fetch email and created_at from the users table" instead of vague requests.',
    },
    {
      title: "Limit result size for large datasets",
      desc: 'Use limits like "top 10", "first 50 rows", or date filters to avoid large result sets.',
    },
    {
      title: "Be precise with filtering conditions",
      desc: "Clearly specify conditions using actual column values, operators, and dates where possible.",
    },
    {
      title: "Avoid SELECT * unless you need all columns",
      desc: "Request only the columns you need to keep queries fast and results readable.",
    },
    {
      title: "Specify sorting when order matters",
      desc: 'Example: "Order results by created_at descending" to control output order.',
    },
    {
      title: "Use clear relationships for joins",
      desc: 'Mention how tables are related, e.g. "users joined with orders on user_id".',
    },
    {
      title: "Reference columns exactly as stored",
      desc: 'Use names like "created_at", "user_id", or "order_status".',
    },
    {
      title: "Ask only database-related questions",
      desc: "This tool generates and executes DB queries, not general explanations or opinions.",
    },
  ];
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="h-9 w-5 cursor-pointer">
          <IoIosInformationCircleOutline className="h-4 w-4 text-zinc-500 hover:text-zinc-700 transition-colors" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-96 p-4 bg-white text-zinc-800 shadow-lg border border-zinc-200"
        align="start"
        side="top"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-200">
            <FaInfoCircle className="h-4 w-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-zinc-900">
              How to Write Effective Queries
            </h3>
          </div>
          <div className="space-y-2.5">
            {suggestion.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                {/* Bullet */}
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-zinc-400 shrink-0" />

                <div>
                  <p className="text-xs font-medium text-zinc-800">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-zinc-500 mt-0.5 leading-snug">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EffectiveQueryPopover;
