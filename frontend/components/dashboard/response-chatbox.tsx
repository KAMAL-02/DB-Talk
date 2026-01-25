"use client";

import { Bot, Clock, Database } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Image from "next/image";

interface ExecutionResult {
  success: boolean;
  data: any[];
  count: number;
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
    <div className="flex items-start gap-2 mb-4 justify-start">
      <div className="h-7 w-7 rounded-md bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
        <Image src="/icon.png" alt="Bot Icon" width={16} height={16} />
      </div>

      <div className="flex flex-col gap-0.5 max-w-[75%] min-w-150">
        <div className="relative bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg rounded-bl-none shadow-lg px-3 py-3">
          <div className="absolute bottom-0 left-0 w-0 h-0 border-t-10 border-t-gray-800 border-r-10 border-r-transparent"></div>
          <div className="absolute bottom-0 left-0 w-0 h-0 border-t-11 border-t-gray-700 border-r-11 border-r-transparent -z-10"></div>

          {/* Tabs for Query and Results */}
          <Tabs defaultValue="results" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700 h-8">
              <TabsTrigger
                value="results"
                className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white text-xs"
              >
                Results
              </TabsTrigger>
              <TabsTrigger
                value="query"
                className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white text-xs"
              >
                Query
              </TabsTrigger>
            </TabsList>

            <TabsContent value="query" className="mt-2">
              {/* Explanation */}
              <div className="mb-2">
                <p className="text-gray-100 text-xs leading-relaxed">
                  {explanation}
                </p>
              </div>

              <Card className="bg-gray-950 border-gray-700">
                <CardContent className="p-3">
                  <pre className="text-[11px] text-green-400 font-mono leading-relaxed overflow-x-auto">
                    {sql}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="mt-2">
              <Card className="bg-gray-950 border-gray-700">
                <CardContent className="p-0">
                  {executionResult.success ? (
                    <ScrollArea className="max-h-60 max-w-full overflow-auto border">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-900 border-b border-gray-700 sticky top-0">
                            <tr>
                              {executionResult.data.length > 0 &&
                                Object.keys(executionResult.data[0]).map(
                                  (key) => (
                                    <th
                                      key={key}
                                      className="px-3 py-1.5 text-left text-[10px] font-semibold text-gray-300 uppercase tracking-wider"
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
                                    className="px-3 py-1.5 text-gray-100 whitespace-nowrap"
                                  >
                                    {value !== null && value !== undefined
                                      ? typeof value === "object"
                                        ? JSON.stringify(value, null, 2)
                                        : String(value)
                                      : "-"}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  ) : (
                    <div className="p-4 text-red-400 text-sm">
                      Query execution failed
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Execution Stats */}
              <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                <div className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  <span>{executionResult.count} rows</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{executionResult.executionTime}ms</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {timestamp && (
          <span className="text-[10px] text-gray-500 ml-1.5">{timestamp}</span>
        )}
      </div>
    </div>
  );
}
