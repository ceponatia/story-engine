"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form";
import { signUp } from "@story-engine/auth";
import Link from "next/link";
const registerSchema = z
    .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
})
    .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});
export function RegisterForm() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    });
    const onSubmit = async (data) => {
        var _a;
        setIsLoading(true);
        setError(null);
        try {
            const result = await signUp.email({
                email: data.email,
                password: data.password,
                name: data.name,
            });
            if (result.error) {
                const errorMessage = result.error.message || "Failed to create account";
                if (errorMessage.includes("email")) {
                    setError("This email address is already registered. Please try logging in instead.");
                }
                else if (errorMessage.includes("password")) {
                    setError("Password must be at least 8 characters long.");
                }
                else if (errorMessage.includes("FAILED_TO_CREATE_USER")) {
                    setError("Unable to create account. Please check your information and try again.");
                }
                else {
                    setError(errorMessage);
                }
            }
            else {
                window.location.href = "/";
            }
        }
        catch (err) {
            const errorMessage = (err === null || err === void 0 ? void 0 : err.message) || ((_a = err === null || err === void 0 ? void 0 : err.details) === null || _a === void 0 ? void 0 : _a.message) || "Something went wrong. Please try again.";
            setError(errorMessage);
            console.error("Registration error:", err);
        }
        finally {
            setIsLoading(false);
        }
    };
    return (<Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Join Story Engine and start your adventures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="enter your name" autoComplete="name" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <FormField control={form.control} name="email" render={({ field }) => (<FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="enter your email" type="email" autoComplete="email" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <FormField control={form.control} name="password" render={({ field }) => (<FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input placeholder="create a password" type="password" autoComplete="new-password" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            <FormField control={form.control} name="confirmPassword" render={({ field }) => (<FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="confirm your password" type="password" autoComplete="new-password" {...field}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>)}/>

            {error && (<div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded">{error}</div>)}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Already have an account? </span>
          <Link href="/auth/login" className="text-primary hover:underline font-medium">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>);
}
