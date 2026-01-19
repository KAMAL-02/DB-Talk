import { Skeleton } from "@/components/ui/skeleton";
import { CardContent, Card } from "./ui/card";
import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";

const DashboardSkeleton = () => {
  return (
    <div className="flex h-screen w-full bg-background">
      <div className="w-72 bg-zinc-900 p-4 space-y-4">
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-8 w-8 rounded-md bg-zinc-800" />
          <Skeleton className="h-6 w-32 bg-zinc-800" />
        </div>

        <div className="space-y-2">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex items-center gap-3 p-2">
              <Skeleton className="h-5 w-5 rounded bg-zinc-800" />
              <Skeleton className="h-4 w-full bg-zinc-800" />
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-3 p-2">
            <Skeleton className="h-8 w-8 rounded-full bg-zinc-800" />
            <Skeleton className="h-4 w-24 bg-zinc-800" />
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-12 bg-white border-b px-6 flex items-center justify-between rounded-tl-xl">
          <Skeleton className="h-6 w-48 bg-gray-200" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-32 rounded-md bg-gray-200" />
            <Skeleton className="h-9 w-9 rounded-full bg-gray-200" />
          </div>
        </div>

        <div className="flex flex-1">
          <div className="flex-1 bg-white p-4">
            <div className="h-full flex flex-col bg-gray-100 rounded-xl p-6">
              <div className="flex-1 space-y-6 max-w-5xl mx-auto w-full">
                <div className="flex justify-end">
                  <div className="space-y-2 max-w-md">
                    <Skeleton className="h-4 w-32 bg-gray-300 ml-auto" />
                    <Skeleton className="h-16 w-full bg-gray-300 rounded-lg" />
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="space-y-2 max-w-2xl w-full">
                    <Skeleton className="h-4 w-32 bg-gray-300" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full bg-gray-300 rounded" />
                      <Skeleton className="h-4 w-5/6 bg-gray-300 rounded" />
                      <Skeleton className="h-4 w-4/6 bg-gray-300 rounded" />
                    </div>
                    <Skeleton className="h-32 w-full bg-gray-300 rounded-lg mt-4" />
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="space-y-2 max-w-md">
                    <Skeleton className="h-4 w-32 bg-gray-300 ml-auto" />
                    <Skeleton className="h-12 w-full bg-gray-300 rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-end gap-2">
                  <Skeleton className="h-12 flex-1 bg-gray-300 rounded-lg" />
                  <Skeleton className="h-12 w-12 bg-gray-300 rounded-lg" />
                </div>
              </div>
            </div>
          </div>

          <div className="w-2 bg-gray-200 flex items-center justify-center">
            <Skeleton className="h-8 w-1 bg-gray-300" />
          </div>

          <div className="w-80 bg-white border-l p-4 space-y-4">
            <div className="space-y-2 pb-4 border-b">
              <Skeleton className="h-6 w-32 bg-gray-200" />
              <Skeleton className="h-9 w-full bg-gray-200 rounded-md" />
            </div>

            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div key={item} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24 bg-gray-200" />
                    <Skeleton className="h-5 w-5 bg-gray-200 rounded" />
                  </div>
                  <Skeleton className="h-3 w-full bg-gray-200" />
                  <Skeleton className="h-3 w-2/3 bg-gray-200" />
                </div>
              ))}
            </div>

            <div className="pt-4 border-t space-y-2">
              <Skeleton className="h-4 w-28 bg-gray-200" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-2 w-2 rounded-full bg-gray-200" />
                <Skeleton className="h-3 w-20 bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DeleteDbModalSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card
          key={i}
          className="relative border border-gray-200 bg-gray-50 rounded-lg"
        >
          <CardContent className="p-3">
            <div className="absolute top-3 right-3">
              <Skeleton className="h-5 w-5 rounded-sm bg-gray-300" />
            </div>

            <div className="flex items-start gap-3">
              <Skeleton className="h-8 w-8 rounded-md bg-gray-300 shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-32 bg-gray-300" />
                <Skeleton className="h-3 w-24 bg-gray-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const DbSidebarSkeleton = () => {
  return (
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
  );
};

const ResponseChatBoxSkeleton = () => {
  return (
    <div className="flex items-start gap-2 mb-4 justify-start">
      {/* Avatar */}
      <div className="h-7 w-7 rounded-md bg-white border border-zinc-200 flex items-center justify-center shrink-0 shadow-sm">
        <Image src="/icon.png" alt="Bot Icon" width={16} height={16} />
      </div>

      <div className="flex flex-col gap-0.5 max-w-[75%] min-w-150">
        <div className="relative bg-linear-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-lg rounded-bl-none shadow-lg px-3 py-3">
          
          {/* bubble tail */}
          <div className="absolute bottom-0 left-0 w-0 h-0 border-t-10 border-t-gray-800 border-r-10 border-r-transparent" />
          <div className="absolute bottom-0 left-0 w-0 h-0 border-t-11 border-t-gray-700 border-r-11 border-r-transparent -z-10" />

          {/* Tabs skeleton */}
          <div className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700 h-8 rounded-md p-1 mb-2 gap-1">
            <Skeleton className="h-6 bg-gray-700" />
            <Skeleton className="h-6 bg-gray-700" />
          </div>

          {/* Explanation skeleton */}
          <div className="space-y-2 mb-2">
            <Skeleton className="h-3 w-full bg-gray-700" />
            <Skeleton className="h-3 w-5/6 bg-gray-700" />
          </div>

          {/* Card skeleton */}
          <Card className="bg-gray-950 border-gray-700">
            <CardContent className="p-3 space-y-2">
              <Skeleton className="h-3 w-full bg-gray-800" />
              <Skeleton className="h-3 w-4/5 bg-gray-800" />
              <Skeleton className="h-3 w-3/5 bg-gray-800" />
              <Skeleton className="h-3 w-5/6 bg-gray-800" />
            </CardContent>
          </Card>

          {/* stats skeleton */}
          <div className="flex items-center gap-3 mt-2">
            <Skeleton className="h-3 w-14 bg-gray-700" />
            <Skeleton className="h-3 w-16 bg-gray-700" />
          </div>
        </div>

        {/* timestamp */}
        <Skeleton className="h-[10px] w-12 bg-gray-600 ml-1.5 mt-1" />
      </div>
    </div>
  );
};

export { DashboardSkeleton, DeleteDbModalSkeleton, DbSidebarSkeleton, ResponseChatBoxSkeleton };
