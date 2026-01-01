"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SiTestcafe } from "react-icons/si";
import { IoWifiSharp } from "react-icons/io5";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldContent, FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import Image from "next/image";
import { notifySuccess, notifyError } from "@/lib/utils";
import useApi from "@/hooks/useApi";
import { testConnection, saveDatabase } from "@/lib/api";
import { useDatabaseStore } from "@/store/useDatabaseStore";

interface AddDatabaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const databaseSchema = z.discriminatedUnion("mode", [
  // URL mode schema
  z.object({
    source: z.enum(["postgres", "mongo"]),
    mode: z.literal("url"),
    dbCredentials: z.object({
      connectionString: z
        .string()
        .min(1, "Connection string is required")
        .refine(
          (val) => {
            if (
              val.startsWith("postgres://") ||
              val.startsWith("postgresql://")
            )
              return true;
            if (
              val.startsWith("mongodb://") ||
              val.startsWith("mongodb+srv://")
            )
              return true;
            return false;
          },
          { message: "Invalid connection string format" }
        ),
    }),
  }),
  // Parts mode schema
  z.object({
    source: z.enum(["postgres", "mongo"]),
    mode: z.literal("parts"),
    dbCredentials: z
      .object({
        host: z.string().min(1, "Host is required"),
        port: z
          .number()
          .min(1, "Port must be a valid number")
          .max(65535, "Port must be between 1 and 65535")
          .optional(),
        database: z.string().min(1, "Database name is required"),
        username: z.string().optional(),
        password: z.string().optional(),
        ssl: z.boolean().optional(),
      })
      .refine((data) => {
        return true;
      }),
  }),
]);

type DatabaseFormData = z.infer<typeof databaseSchema>;

export function AddDatabaseModal({
  open,
  onOpenChange,
}: AddDatabaseModalProps) {
  const [selectedDb, setSelectedDb] = useState<"postgres" | "mongo">(
    "postgres"
  );
  const [connectionMethod, setConnectionMethod] = useState<"url" | "parts">(
    "parts"
  );
  const [submitAction, setSubmitAction] = useState<"test" | "save">("test");
  const [databaseId, setDatabaseId] = useState<string | null>(null);
  const [dbName, setDbName] = useState<string>("");

  const triggerRefresh = useDatabaseStore((state) => state.triggerRefresh);
  const { handleRequest: callTestConnection } = useApi(testConnection);
  const { handleRequest: callSaveDatabase } = useApi(saveDatabase);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DatabaseFormData>({
    resolver: zodResolver(databaseSchema),
    defaultValues: {
      source: "postgres",
      mode: "parts",
      dbCredentials: {
        host: "",
        port: undefined,
        database: "",
        username: "",
        password: "",
        ssl: false,
      },
    } as DatabaseFormData,
  });

  useEffect(() => {
    setValue("source", selectedDb);
    setValue("mode", connectionMethod);
  }, [selectedDb, connectionMethod, setValue]);

  const onSubmit = async (data: DatabaseFormData) => {
    try {
      if (data.mode === "parts" && !data.dbCredentials.port) {
        data.dbCredentials.port = data.source === "postgres" ? 5432 : 27017;
      }
      
      console.log("Form data:", data);
      console.log("Action:", submitAction);

      if (submitAction === "test") {
        const response = await callTestConnection(data);
        const databaseId = response.data.data.databaseId;
        setDatabaseId(databaseId);
        notifySuccess("Connection successful!");
      } else {
        if (!databaseId) {
          throw new Error(
            "Please test the connection before saving the database."
          );
        }
        if (!dbName.trim()) {
          notifyError({ message: "Database name is required" }, "Validation Error");
          return;
        }
        const savePayload = {
          source: data.source,
          mode: data.mode,
          databaseId: databaseId,
          dbName: dbName.trim(),
        };
        const response = await callSaveDatabase(savePayload);
        console.log("Save response:", response);
        notifySuccess("Database added successfully");
        reset();
        setDbName("");
        onOpenChange(false);
        triggerRefresh();
      }
    } catch (error: any) {
      if (error instanceof Error) {
        notifyError(error, "Failed to save database");
        return;
      }
      notifyError(
        error?.response,
        submitAction === "test"
          ? "Connection failed"
          : "Failed to save database"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] min-h-[90vh] overflow-y-auto bg-white text-gray-900 border-gray-200">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gray-900">
            Add Database
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Connect to your database by selecting a type and providing
            credentials.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">
              Database Type
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selectedDb === "postgres"
                    ? "border-gray-400 bg-gray-50"
                    : "border-gray-200 bg-white"
                }`}
                onClick={() => setSelectedDb("postgres")}
              >
                <CardContent className="flex flex-col items-center justify-center p-3 gap-2">
                  <Image
                    src="/postgres-icon.png"
                    alt="PostgreSQL"
                    width={48}
                    height={48}
                  />
                  <p className="text-sm font-semibold text-blue-800">
                    PostgreSQL
                  </p>
                </CardContent>
              </Card>

              <Card
                className={`cursor-pointer transition-all border-2 ${
                  selectedDb === "mongo"
                    ? "border-zinc-400 bg-gray-50"
                    : "border-gray-200 bg-white"
                }`}
                onClick={() => setSelectedDb("mongo")}
              >
                <CardContent className="flex flex-col items-center justify-center p-3 gap-2">
                  <Image
                    src="/mongo-icon.png"
                    alt="MongoDB"
                    width={68}
                    height={68}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Database Display Name */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">
              Database Display Name
            </Label>
            <Field>
              <FieldContent>
                <Input
                  id="dbName"
                  placeholder="My Production Database"
                  value={dbName}
                  onChange={(e) => setDbName(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A friendly name to identify this database connection
                </p>
              </FieldContent>
            </Field>
          </div>

          {/* Connection Credentials */}
          <div className="space-y-3">
            <Label className="text-base font-semibold text-gray-900">
              Connection Credentials
            </Label>
            <Tabs
              value={connectionMethod}
              onValueChange={(v) => setConnectionMethod(v as "url" | "parts")}
            >
              <TabsList className="grid w-full grid-cols-2 bg-transparent! h-auto! p-0!">
                <TabsTrigger
                  value="parts"
                  className=" text-black! data-[state=active]:border-gray-400! !data-[state=active]:bg-white !data-[state=active]:text-gray-900"
                >
                  By Parts
                </TabsTrigger>
                <TabsTrigger
                  value="url"
                  className=" text-black! data-[state=active]:border-gray-400! !data-[state=active]:bg-white !data-[state=active]:text-gray-900"
                >
                  Connection String
                </TabsTrigger>
              </TabsList>

              <TabsContent value="parts" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <Label htmlFor="host" className="text-gray-700">
                      Host
                    </Label>
                    <FieldContent>
                      <Input
                        id="host"
                        placeholder="localhost"
                        aria-invalid={!!errors.dbCredentials}
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                        {...register("dbCredentials.host")}
                      />
                      <FieldError
                        errors={[
                          errors.dbCredentials && "host" in errors.dbCredentials
                            ? errors.dbCredentials.host
                            : undefined,
                        ]}
                        className="text-left text-xs"
                      />
                    </FieldContent>
                  </Field>

                  <Field>
                    <Label htmlFor="port" className="text-gray-700">
                      Port
                    </Label>
                    <FieldContent>
                      <Input
                        id="port"
                        type="number"
                        placeholder={
                          selectedDb === "postgres" ? "5432" : "27017"
                        }
                        aria-invalid={!!errors.dbCredentials}
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                        {...register("dbCredentials.port", {
                          setValueAs: (v) => v === "" || v === null || v === undefined ? undefined : parseInt(v),
                        })}
                      />
                      <FieldError
                        errors={[
                          errors.dbCredentials && "port" in errors.dbCredentials
                            ? errors.dbCredentials.port
                            : undefined,
                        ]}
                        className="text-left text-xs"
                      />
                    </FieldContent>
                  </Field>
                </div>

                <Field>
                  <Label htmlFor="database" className="text-gray-700">
                    Database Name
                  </Label>
                  <FieldContent>
                    <Input
                      id="database"
                      placeholder="my_database"
                      aria-invalid={!!errors.dbCredentials}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      {...register("dbCredentials.database")}
                    />
                    <FieldError
                      errors={[
                        errors.dbCredentials &&
                        "database" in errors.dbCredentials
                          ? errors.dbCredentials.database
                          : undefined,
                      ]}
                      className="text-left text-xs"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <Label htmlFor="username" className="text-gray-700">
                    Username{" "}
                    {selectedDb === "postgres" && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <FieldContent>
                    <Input
                      id="username"
                      placeholder="admin"
                      aria-invalid={!!errors.dbCredentials}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      {...register("dbCredentials.username")}
                    />
                    <FieldError
                      errors={[
                        errors.dbCredentials &&
                        "username" in errors.dbCredentials
                          ? errors.dbCredentials.username
                          : undefined,
                      ]}
                      className="text-left text-xs"
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <Label htmlFor="password" className="text-gray-700">
                    Password{" "}
                    {selectedDb === "postgres" && (
                      <span className="text-red-500">*</span>
                    )}
                  </Label>
                  <FieldContent>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      aria-invalid={!!errors.dbCredentials}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      {...register("dbCredentials.password")}
                    />
                    <FieldError
                      errors={[
                        errors.dbCredentials &&
                        "password" in errors.dbCredentials
                          ? errors.dbCredentials.password
                          : undefined,
                      ]}
                      className="text-left text-xs"
                    />
                  </FieldContent>
                </Field>

                <div className="flex items-center space-x-2">
                <Controller
                  name="dbCredentials.ssl"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="ssl"
                      checked={field.value}
                      className="border-gray-400"
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true);
                      }}
                    />
                  )}
                />
                <Label
                  htmlFor="ssl"
                  className="text-gray-700 cursor-pointer font-normal"
                >
                  Enable SSL{" "}
                  <span className="text-xs text-gray-500">
                    (Enable if your database requires SSL/TLS connection)
                  </span>
                </Label>
                </div>

              </TabsContent>

              <TabsContent value="url" className="space-y-4 mt-4">
                <Field>
                  <Label htmlFor="connectionString" className="text-gray-700">
                    Connection String
                  </Label>
                  <FieldContent>
                    <Input
                      id="connectionString"
                      placeholder={
                        selectedDb === "postgres"
                          ? "postgresql://user:password@localhost:5432/database"
                          : "mongodb://user:password@localhost:27017/database"
                      }
                      aria-invalid={!!errors.dbCredentials}
                      className="font-mono text-sm bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
                      {...register("dbCredentials.connectionString")}
                    />
                    <FieldError
                      errors={[
                        errors.dbCredentials &&
                        "connectionString" in errors.dbCredentials
                          ? errors.dbCredentials.connectionString
                          : undefined,
                      ]}
                      className="text-left text-xs"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter the full connection string for your{" "}
                      {selectedDb === "postgres" ? "PostgreSQL" : "MongoDB"}{" "}
                      database
                    </p>
                  </FieldContent>
                </Field>
              </TabsContent>
            </Tabs>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="submit"
              onClick={() => setSubmitAction("test")}
              className="bg-zinc-900 text-white hover:bg-gray-800 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting && submitAction === "test" ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Testing...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <IoWifiSharp className="h-4 w-4 text-orange-400" />
                  Test Connection
                </span>
              )}
            </Button>
            <Button
              type="submit"
              onClick={() => setSubmitAction("save")}
              className="bg-zinc-900 text-white hover:bg-gray-800 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSubmitting && submitAction === "save" ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner className="h-4 w-4" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <SiTestcafe className="h-4 w-4 text-orange-400" />
                  Save Database
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
