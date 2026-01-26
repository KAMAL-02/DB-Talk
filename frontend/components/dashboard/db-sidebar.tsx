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
import { DbSidebarSkeleton } from "@/components/skeletons";

interface Database {
  id: string;
  source: string;
  mode: "url" | "parameters";
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
      <Image src="/mongo-icon.png" alt="MongoDB Icon" width={32} height={32} />
    );
  };
  return (
    <div className="h-screen rounded-r-xl bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="px-3 py-3 border-b border-gray-300">
        <div className="flex items-center gap-2">
         <Image src="/icon.png" alt="Database Icon" width={20} height={20} />
          <h3 className="text-base text-gray-900 font-semibold">
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
          <DbSidebarSkeleton/>
        ) : databases.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FaDatabase className="h-10 w-10 text-gray-300 mb-2" />
            <p className="text-xs text-gray-500 font-medium">
              No databases saved
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Add a database to get started
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {databases.map((db) => (
              <div
                key={db.id}
                className={`relative cursor-pointer transition-all border rounded-lg p-2 overflow-hidden group
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

                <div className="relative flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={`w-2.5 h-2.5 min-w-2.5 min-h-2.5 rounded-full ${
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

                  <p className="font-semibold text-gray-900 text-xs truncate">
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
