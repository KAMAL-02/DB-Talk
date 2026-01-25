"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import { FiGithub } from "react-icons/fi";
import Image from "next/image";
import DisconnectDatabase from "@/components/dashboard/disconnect-database";

export function AppHeader() {
  const { connectedDatabase } = useDatabaseStore();

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
      <Image src="/mongo-icon.png" alt="MongoDB Icon" width={28} height={28} />
    );
  };

  return (
    <header className="flex h-(--header-height) bg-gray-100 rounded-l-xl shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 text-black hover:text-none hover:bg-zinc-900/80" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        
        {connectedDatabase ? (
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              {getDatabaseIcon(connectedDatabase.source)}
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-base text-gray-900 font-semibold">
                {connectedDatabase.dbName}
              </h1>
              <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-200 rounded">
                {connectedDatabase.source.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 border border-green-700 animate-pulse" />
              <span className="text-xs text-gray-600 font-medium">Connected</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-sm text-gray-500">No database connected</span>
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          <DisconnectDatabase />
          <Button size="sm" className="hidden sm:flex gap-2 ">
          <FiGithub size={16}/>
          <a
            href="https://github.com/KAMAL-02/DB-TALK"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </Button>
        </div>
      </div>
    </header>
  );
}
