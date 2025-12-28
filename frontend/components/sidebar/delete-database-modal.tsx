"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";
import useApi from "@/hooks/useApi";
import { listDatabase, deleteDatabase } from "@/lib/api";
import { useDatabaseStore } from "@/store/useDatabaseStore";
import { notifySuccess, notifyError } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";

interface Database {
  id: string;
  source: "postgres" | "mongo";
  mode: "url" | "parts";
  dbName: string;
}

interface DeleteDatabaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteDatabaseModal({
  open,
  onOpenChange,
}: DeleteDatabaseModalProps) {
  const [databases, setDatabases] = useState<Database[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDatabases, setSelectedDatabases] = useState<Set<string>>(
    new Set()
  );
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const triggerRefresh = useDatabaseStore((state) => state.triggerRefresh);
  const { handleRequest: callListDatabases } = useApi(listDatabase);
  const { handleRequest: callDeleteDatabase } = useApi(deleteDatabase);

  useEffect(() => {
    if (open) {
      fetchDatabases();
      setSelectedDatabases(new Set());
      setConfirmDelete(false);
    }
  }, [open]);

  const fetchDatabases = async () => {
    try {
      setLoading(true);
      const response = await callListDatabases();
      if (response.data?.data) {
        setDatabases(response.data.data);
      }
    } catch (error) {
      console.error("Failed to fetch databases:", error);
      notifyError(error, "Failed to fetch databases");
    } finally {
      setLoading(false);
    }
  };

  const toggleDatabaseSelection = (databaseId: string) => {
    const newSelection = new Set(selectedDatabases);
    if (newSelection.has(databaseId)) {
      newSelection.delete(databaseId);
    } else {
      newSelection.add(databaseId);
    }
    setSelectedDatabases(newSelection);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      notifyError(
        { message: "Please confirm the deletion" },
        "Confirmation Required"
      );
      return;
    }

    if (selectedDatabases.size === 0) {
      notifyError(
        { message: "Please select at least one database to delete" },
        "No Selection"
      );
      return;
    }

    try {
      setIsDeleting(true);
      const databaseIds = Array.from(selectedDatabases);
      await callDeleteDatabase({ databaseIds });

      notifySuccess(
        `Successfully deleted ${databaseIds.length} database${
          databaseIds.length > 1 ? "s" : ""
        }`
      );

      setSelectedDatabases(new Set());
      setConfirmDelete(false);
      onOpenChange(false);
      triggerRefresh();
    } catch (error) {
      console.error("Failed to delete databases:", error);
      notifyError(error, "Failed to delete databases");
    } finally {
      setIsDeleting(false);
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
      <Image src="/mongo-icon.png" alt="MongoDB Icon" width={28} height={28} />
    );
  };

  const getModeText = (mode: string) => {
    return mode === "url" ? "Connection String" : "Parameters";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:min-w-280 min-h-[90vh] max-h-[90vh] overflow-hidden bg-white text-gray-900 border-gray-200 flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">
            Delete Databases
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Select databases you want to remove. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          {loading ? (
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
          ) : databases.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm text-gray-500 font-medium">
                No databases found
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Add a database first to be able to delete it
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
              {databases.map((db) => (
                <Card
                  key={db.id}
                  className={`cursor-pointer transition border rounded-lg ${
                    selectedDatabases.has(db.id)
                      ? "border-gray-400 bg-gray-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                  onClick={() => toggleDatabaseSelection(db.id)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedDatabases.has(db.id)}
                        onCheckedChange={() => toggleDatabaseSelection(db.id)}
                        className="h-5 w-5"
                      />

                      <div className="shrink-0">
                        {getDatabaseIcon(db.source)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {db.dbName}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-600">
                          <span className="font-medium">
                            {db.source.toUpperCase()}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>{getModeText(db.mode)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-gray-200 pt-4 mt-4 space-y-4">
          <div className="flex items-start gap-3 px-1">
            <Checkbox
              id="confirm-delete"
              checked={confirmDelete}
              onCheckedChange={(checked) =>
                setConfirmDelete(checked as boolean)
              }
              className="
                    h-5 w-5
                    border border-gray-400
                    bg-white
                    data-[state=checked]:bg-red-600
                    data-[state=checked]:border-zinc-900
                    data-[state=checked]:text-black
                "
            />
            <Label
              htmlFor="confirm-delete"
              className="text-sm text-gray-700 cursor-pointer leading-relaxed"
            >
              I understand this is an irreversible action and all selected
              databases will be permanently removed.
            </Label>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isDeleting}
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              disabled={
                !confirmDelete ||
                selectedDatabases.size === 0 ||
                isDeleting ||
                loading
              }
              className="bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <span className="flex items-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Deleting...
                </span>
              ) : (
                `Delete ${
                  selectedDatabases.size > 0
                    ? `(${selectedDatabases.size})`
                    : ""
                }`
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
