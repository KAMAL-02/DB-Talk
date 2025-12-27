"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { notifySuccess, notifyError } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldError,
} from "@/components/ui/field";
import { Spinner } from "../ui/spinner";
import { login } from "@/lib/api";
import useApi from "@/hooks/useApi";
import { useRouter } from "next/navigation";

const authSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type AuthFormData = z.infer<typeof authSchema>;

const AuthForm = () => {

  const { handleRequest: callLoginApi } = useApi(login);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      console.log("Form data:", data);
      const response = await callLoginApi(data);

      if(response.status !== 200){
        throw new Error(response.data.error);
      }
      router.push("/chat");
      notifySuccess("Login successful");
    } catch (error: any) {
      notifyError(error?.response, "Login failed");
    }
  };

  return (
    <Card className="w-full max-w-md border">
      <CardHeader>
        <CardTitle>Welcome</CardTitle>
        <CardDescription>
          Please sign in to your account to proceed
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-9">
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              <FieldError
                errors={[errors.email]}
                className="text-left text-xs"
              />
            </FieldContent>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <FieldContent>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              <FieldError
                errors={[errors.password]}
                className="text-left text-xs"
              />
            </FieldContent>
          </Field>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner className="h-4 w-4" />
                Signing in
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
