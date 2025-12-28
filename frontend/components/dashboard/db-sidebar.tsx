"use client";

import { useState, useEffect } from "react";
import { FaDatabase } from "react-icons/fa";
import useApi from "@/hooks/useApi";
import { listDatabase, connectDatabase, getActiveDatabase } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import { notifySuccess, notifyError } from "@/lib/utils";
import { Spinner } from "../ui/spinner";
import { FaConnectdevelop } from "react-icons/fa6";

interface Database {
  id: string;
  source: "postgres" | "mongo";
  mode: "url" | "parts";
  dbName: string;
}

const DbSidebar = () => {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDb, setSelectedDb] = useState<string | null>(null);
  const [hoveredDb, setHoveredDb] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);

  const { refreshTrigger, connectedDatabase, setConnectedDatabase } =
    useDatabaseStore();
  const { handleRequest: callListDatabases } = useApi(listDatabase);
  const { handleRequest: callConnectDatabase } = useApi(connectDatabase);
  const { handleRequest: callGetActiveDatabase } = useApi(getActiveDatabase);

  useEffect(() => {
    const fetchDatabase = async () => {
      try {
        setLoading(true);
        const response = await callListDatabases();
        console.log("Databases:", response);
        if (response.data?.data) {
          setDatabases(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch databases:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatabase();
  }, [refreshTrigger]);

  useEffect(() => {
    const fetchActiveDatabase = async () => {
      try {
        const response = await callGetActiveDatabase();
        if (response.data?.data) {
          setConnectedDatabase({
            databaseId: response.data.data.databaseId,
            dbName: response.data.data.dbName,
            source: response.data.data.source,
          });
        }
      } catch (error) {
        console.error("Failed to fetch active database:", error);
      }
    };
    fetchActiveDatabase();
  }, []);

  const handleConnect = async (e: any, databaseId: string) => {
    e.stopPropagation();
    try {
      setConnecting(databaseId);
      const response = await callConnectDatabase({ databaseId });
      console.log("Connect response:", response);
      if (response.data?.data) {
        setConnectedDatabase({
          databaseId: response.data.data.databaseId,
          dbName: response.data.data.dbName,
          source: response.data.data.source,
        });
      }

      notifySuccess("Database connected successfully!");
    } catch (error) {
      console.error("Failed to connect database:", error);
      notifyError(error, "Failed to connect database");
    } finally {
      setConnecting(null);
    }
  };

  const getDatabaseIcon = (source: string) => {
    if (source === "postgres") {
      return (
        <Image
          src="/postgres-icon.png"
          alt="Postgres Icon"
          width={32}
          height={32}
        />
      );
    }
    return (
      <Image src="/mongo-icon.png" alt="MongoDB Icon" width={20} height={20} />
    );
  };
  return (
    <div className="h-full rounded-r-xl bg-white border-l border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="px-4 py-4 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <FaDatabase className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg text-gray-900 font-semibold">
            Saved Databases
          </h3>
        </div>
        {loading ? (
          <Skeleton className="h-4 w-20 mt-1 bg-gray-300" />
        ) : (
          <p className="text-xs text-black mt-1">
            {databases.length}{" "}
            {databases.length === 1 ? "database" : "databases"} present
          </p>
        )}
      </div>

      <ScrollArea className="flex-1 px-4 py-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg border border-gray-200 bg-gray-100 p-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-md bg-gray-300 shrink-0" />
                  <Skeleton className="h-4 flex-1 bg-gray-300" />
                </div>
              </div>
            ))}
          </div>
        ) : databases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FaDatabase className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm text-gray-500 font-medium">
              No databases saved
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Add a database to get started
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {databases.map((db) => (
              <div
                key={db.id}
                className={`relative cursor-pointer transition-all border rounded-lg p-3 overflow-hidden group
                  border-gray-200 bg-white hover:border-gray-300
                `}
                onClick={() => setSelectedDb(db.id)}
                onMouseEnter={() => setHoveredDb(db.id)}
                onMouseLeave={() => setHoveredDb(null)}
              >
                <div
                  className={`absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200 ${
                    hoveredDb === db.id
                      ? "opacity-100"
                      : "opacity-0 pointer-events-none"
                  }`}
                />

                <div className="relative flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 min-w-3 min-h-3 rounded-full ${
                        connectedDatabase?.databaseId === db.id
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    />

                    {connecting === db.id ? (
                      <Spinner className="h-4 w-4 text-black" />
                    ) : (
                      <span className="shrink-0">
                        {getDatabaseIcon(db.source)}
                      </span>
                    )}
                  </div>

                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {db.dbName} | {db.source.toUpperCase()}
                  </p>
                </div>

                {connectedDatabase?.databaseId !== db.id && (
                  <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${
                      hoveredDb === db.id
                        ? "opacity-100"
                        : "opacity-0 pointer-events-none"
                    }`}
                  >
                    <Button
                      onClick={(e) => handleConnect(e, db.id)}
                      disabled={connecting === db.id}
                      className="
                      bg-black/90 text-white
                      hover:bg-black/90 hover:text-white
                      focus:bg-black/90
                      border border-black/80
                      shadow-lg
                      transition-all duration-200
                    "
                    >
                      <span className="flex items-center gap-2">
                        <FaConnectdevelop className="h-4 w-4 text-orange-400" />
                        Connect
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DbSidebar;
