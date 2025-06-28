"use client";

import { useState, useRef, useEffect, useOptimistic, startTransition } from "react";
import { sendMessage } from "@/app/actions/adventures";
import { generateLLMResponse } from "@/app/actions/llm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

interface Message {
  id: string;
  adventure_id: string;
  role: "user" | "assistant" | "system"; // Updated to match database schema
  content: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  user_id?: string;
  // Optimistic update fields
  isPending?: boolean;
  isFailed?: boolean;
  tempId?: string;
}

interface Adventure {
  id: string;
  name: string; // Database uses 'name' not 'title'
  adventure_characters: Array<{ name: string }>;
}

interface AdventureChatProps {
  adventure: Adventure;
  initialMessages: Message[];
  userId: string;
}

export function AdventureChat({ adventure, initialMessages }: AdventureChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: Message) => [...state, newMessage]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [, setPendingMessageId] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [optimisticMessages]);

  // Update messages when server state changes
  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  const handleSendMessage = async () => {
    if (isLoading || isGeneratingResponse) return;

    const userMessage = input.trim();
    
    // If there's input, send it as a new user message and get LLM response
    if (userMessage) {
      const tempMessageId = `temp-${Date.now()}`;
      setInput("");
      setError(null);
      setPendingMessageId(tempMessageId);

      // Optimistic update: Add user message immediately
      const optimisticUserMessage: Message = {
        id: tempMessageId,
        adventure_id: adventure.id,
        role: "user",
        content: userMessage,
        created_at: new Date().toISOString(),
        user_id: "current-user", // Placeholder
        isPending: true,
        tempId: tempMessageId
      };
      
      startTransition(() => {
        addOptimisticMessage(optimisticUserMessage);
      });
      setIsLoading(true);

      try {
        // Create FormData for server action
        const formData = new FormData();
        formData.append('adventureId', adventure.id);
        formData.append('content', userMessage);

        // Send user message
        const userResult = await sendMessage(formData);
        if (userResult.success && userResult.message) {
          // Replace optimistic message with real one
          setMessages(prev => {
            const filtered = prev.filter(msg => msg.tempId !== tempMessageId);
            return [...filtered, userResult.message];
          });
          setPendingMessageId(null);
          setIsLoading(false);
          setIsGeneratingResponse(true);

          // Generate LLM response
          const llmResult = await generateLLMResponse(adventure.id, userMessage);
          if (llmResult.success && llmResult.message) {
            setMessages(prev => [...prev, llmResult.message]);
          } else if (!llmResult.success && llmResult.error) {
            setError(llmResult.error);
          }
        }
      } catch (error) {
        console.error("Error sending message:", error);
        setError(error instanceof Error ? error.message : "Failed to send message. Please try again.");
        // Mark optimistic message as failed
        setMessages(prev => 
          prev.map(msg => 
            msg.tempId === tempMessageId 
              ? { ...msg, isPending: false, isFailed: true }
              : msg
          )
        );
        setPendingMessageId(null);
      } finally {
        setIsLoading(false);
        setIsGeneratingResponse(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } else {
      // If input is empty, find the last user message and regenerate LLM response
      const lastUserMessage = [...messages].reverse().find(msg => 
        msg.role === "user"
      );
      
      if (!lastUserMessage) {
        setError("No previous user message found to regenerate response.");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        setIsGeneratingResponse(true);
        // Generate LLM response using the last user message
        const llmResult = await generateLLMResponse(adventure.id, lastUserMessage.content);
        if (llmResult.success && llmResult.message) {
          setMessages(prev => [...prev, llmResult.message]);
        } else if (!llmResult.success && llmResult.error) {
          setError(llmResult.error);
        }
      } catch (error) {
        console.error("Error regenerating LLM response:", error);
        setError(error instanceof Error ? error.message : "Failed to regenerate response. Please try again.");
      } finally {
        setIsLoading(false);
        setIsGeneratingResponse(false);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] p-4">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold">{adventure.name}</h1>
        <p className="text-sm text-muted-foreground">
          Playing as {adventure.adventure_characters[0]?.name}
        </p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {optimisticMessages.map((message) => {
              // User messages have role 'user', assistant/character messages have role 'assistant'
              const isUserMessage = message.role === "user";
              
              return (
                <div
                  key={message.tempId || message.id}
                  className={`flex ${
                    isUserMessage ? "justify-end" : "justify-start"
                  }`}
                >
                  <Card
                    className={`max-w-[80%] relative ${
                      isUserMessage
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    } ${
                      message.isPending ? "opacity-70" : ""
                    } ${
                      message.isFailed ? "border-red-500 bg-red-50" : ""
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <p className="text-sm flex-1">{message.content}</p>
                        {message.isPending && (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                        {message.isFailed && (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        {!message.isPending && !message.isFailed && !message.tempId && (
                          <CheckCircle className="h-3 w-3 text-green-500 opacity-70" />
                        )}
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                        {message.isPending && " • Sending..."}
                        {message.isFailed && " • Failed to send"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
            {isGeneratingResponse && (
              <div className="flex justify-start">
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      <p className="text-sm">AI is thinking...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          {error && (
            <Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your action or dialogue..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage} 
              disabled={isLoading || isGeneratingResponse}
              className="min-w-[80px]"
            >
              {isLoading || isGeneratingResponse ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                input.trim() ? "Send" : "Continue"
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}