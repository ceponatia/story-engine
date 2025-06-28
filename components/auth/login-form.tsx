"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { signIn } from "@/lib/auth-client"
import Link from "next/link"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type LoginFormData = z.infer<typeof loginSchema>

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn.email({
        email: data.email,
        password: data.password,
      })

      if (result.error) {
        // Provide more specific error messages based on error type
        let errorMessage = "Failed to sign in"
        
        if (result.error.message) {
          if (result.error.message.includes("Invalid email or password")) {
            errorMessage = "Invalid email or password. Please check your credentials and try again."
          } else if (result.error.message.includes("User not found")) {
            errorMessage = "No account found with this email address. Please sign up first."
          } else if (result.error.message.includes("Invalid password")) {
            errorMessage = "Incorrect password. Please try again."
          } else if (result.error.message.includes("Email not verified")) {
            errorMessage = "Please verify your email address before signing in."
          } else if (result.error.message.includes("Account disabled")) {
            errorMessage = "Your account has been disabled. Please contact support."
          } else if (result.error.message.includes("Too many attempts")) {
            errorMessage = "Too many failed login attempts. Please wait a few minutes before trying again."
          } else {
            errorMessage = result.error.message
          }
        }
        
        setError(errorMessage)
        console.error("Login error details:", {
          error: result.error,
          email: data.email,
          timestamp: new Date().toISOString()
        })
      } else {
        // Redirect to dashboard on successful login
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Login error:", err)
      
      // Provide more specific error handling for network/connection issues
      if (err instanceof Error) {
        if (err.message.includes("fetch")) {
          setError("Unable to connect to the server. Please check your internet connection and try again.")
        } else if (err.message.includes("timeout")) {
          setError("Request timed out. Please try again.")
        } else {
          setError(`Login failed: ${err.message}`)
        }
      } else {
        setError("Something went wrong. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your email and password to access your adventures
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="enter your email"
                      type="email"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="enter your password"
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && (
              <div className="text-sm text-red-600 text-center bg-red-50 p-3 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">Don&apos;t have an account? </span>
          <Link 
            href="/auth/register" 
            className="text-primary hover:underline font-medium"
          >
            Sign up
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}