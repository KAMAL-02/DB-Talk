"use client";

import { Bot, Clock, Database } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FaDatabase } from "react-icons/fa";

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

interface ResponseInputProps {
  data: ResponseData;
  timestamp?: string;
}

export function ResponseChatBox({ data, timestamp }: ResponseInputProps) {
  const { sql, explanation, executionResult } = data;

  return (
    <div className="flex items-start gap-3 mb-6 justify-start">
      <Avatar className="h-8 w-8 bg-linear-to-br from-orange-500 to-orange-600 text-white flex items-center justify-center shrink-0">
      <FaDatabase size={16} />
      </Avatar>
      
      <div className="flex flex-col gap-1 max-w-[80%] min-w-150">
        <div className="relative bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg rounded-bl-none shadow-lg px-4 py-4">
          <div className="absolute bottom-0 left-0 w-0 h-0 border-t-12 border-t-gray-800 border-r-12 border-r-transparent"></div>
          <div className="absolute bottom-0 left-0 w-0 h-0 border-t-13 border-t-gray-700 border-r-13 border-r-transparent -z-10"></div>

          {/* Tabs for Query and Results */}
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700">
              <TabsTrigger
                value="results"
                className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              >
                Results ({executionResult.rowCount})
              </TabsTrigger>
              <TabsTrigger
                value="query"
                className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white"
              >
                SQL Query
              </TabsTrigger>
            </TabsList>

            <TabsContent value="query" className="mt-3">
              {/* Explanation */}
              <div className="mb-3">
                <p className="text-gray-100 text-sm leading-relaxed">
                  {explanation}
                </p>
              </div>
              
              <Card className="bg-gray-950 border-gray-700">
                <CardContent className="p-4">
                  <pre className="text-xs text-green-400 font-mono leading-relaxed overflow-x-auto">
                    {sql}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="mt-3">
              <Card className="bg-gray-950 border-gray-700">
                <CardContent className="p-0">
                  {executionResult.success ? (
                    <ScrollArea className="max-h-70 overflow-auto border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-900 border-b border-gray-700 sticky top-0">
                            <tr>
                              {executionResult.data.length > 0 &&
                                Object.keys(executionResult.data[0]).map(
                                  (key) => (
                                    <th
                                      key={key}
                                      className="px-4 py-2 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider"
                                    >
                                      {key}
                                    </th>
                                  )
                                )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {executionResult.data.map((row, idx) => (
                              <tr
                                key={idx}
                                className="hover:bg-gray-900/50 transition-colors"
                              >
                                {Object.values(row).map((value: any, i) => (
                                  <td
                                    key={i}
                                    className="px-4 py-2 text-gray-100 whitespace-nowrap"
                                  >
                                    {value !== null && value !== undefined
                                      ? String(value)
                                      : "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="p-4 text-red-400 text-sm">
                      Query execution failed
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Execution Stats */}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Database className="h-3.5 w-3.5" />
                  <span>{executionResult.rowCount} rows</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{executionResult.executionTime}ms</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {timestamp && (
          <span className="text-xs text-gray-500 ml-2">
            {timestamp}
          </span>
        )}
      </div>
    </div>
  );
}

