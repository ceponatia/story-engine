"use client";
import { useState, useRef, useEffect, useOptimistic, startTransition } from "react";
import { useRouter } from "next/navigation";
import { sendMessage, editMessage, deleteMessage } from "@/lib/actions/adventures";
import { generateLLMResponse } from "@/lib/actions/llm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, XCircle, Edit2, Check, X } from "lucide-react";
export function AdventureChat({ adventure, initialMessages }) {
    var _a;
    const router = useRouter();
    const [messages, setMessages] = useState(initialMessages);
    const [optimisticMessages, addOptimisticMessage] = useOptimistic(messages, (state, newMessage) => [...state, newMessage]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
    const [error, setError] = useState(null);
    const scrollAreaRef = useRef(null);
    const inputRef = useRef(null);
    const [, setPendingMessageId] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editingContent, setEditingContent] = useState("");
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [optimisticMessages]);
    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages]);
    const handleSendMessage = async () => {
        if (isLoading || isGeneratingResponse)
            return;
        const userMessage = input.trim();
        if (userMessage) {
            const tempMessageId = `temp-${Date.now()}`;
            setInput("");
            setError(null);
            setPendingMessageId(tempMessageId);
            const optimisticUserMessage = {
                id: tempMessageId,
                adventure_id: adventure.id,
                role: "user",
                content: userMessage,
                created_at: new Date().toISOString(),
                user_id: "current-user",
                isPending: true,
                tempId: tempMessageId,
            };
            startTransition(() => {
                addOptimisticMessage(optimisticUserMessage);
            });
            setIsLoading(true);
            try {
                const formData = new FormData();
                formData.append("adventureId", adventure.id);
                formData.append("content", userMessage);
                const userResult = await sendMessage(formData);
                if (userResult.success && userResult.message) {
                    setPendingMessageId(null);
                    setIsLoading(false);
                    setIsGeneratingResponse(true);
                    const llmResult = await generateLLMResponse(adventure.id, userMessage);
                    if (llmResult.success && llmResult.message) {
                        router.refresh();
                    }
                    else if (!llmResult.success && llmResult.error) {
                        setError(llmResult.error);
                    }
                }
            }
            catch (error) {
                console.error("Error sending message:", error);
                setError(error instanceof Error ? error.message : "Failed to send message. Please try again.");
                setMessages((prev) => prev.map((msg) => msg.tempId === tempMessageId ? Object.assign(Object.assign({}, msg), { isPending: false, isFailed: true }) : msg));
                setPendingMessageId(null);
            }
            finally {
                setIsLoading(false);
                setIsGeneratingResponse(false);
                setTimeout(() => {
                    var _a;
                    (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                }, 100);
            }
        }
        else {
            const lastUserMessage = [...messages].reverse().find((msg) => msg.role === "user");
            if (!lastUserMessage) {
                setError("No previous user message found to regenerate response.");
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                setIsGeneratingResponse(true);
                const llmResult = await generateLLMResponse(adventure.id, lastUserMessage.content);
                if (llmResult.success && llmResult.message) {
                    router.refresh();
                }
                else if (!llmResult.success && llmResult.error) {
                    setError(llmResult.error);
                }
            }
            catch (error) {
                console.error("Error regenerating LLM response:", error);
                setError(error instanceof Error
                    ? error.message
                    : "Failed to regenerate response. Please try again.");
            }
            finally {
                setIsLoading(false);
                setIsGeneratingResponse(false);
                setTimeout(() => {
                    var _a;
                    (_a = inputRef.current) === null || _a === void 0 ? void 0 : _a.focus();
                }, 100);
            }
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    const handleEditMessage = async (messageId, content) => {
        try {
            const formData = new FormData();
            formData.append("messageId", messageId);
            formData.append("content", content);
            formData.append("adventureId", adventure.id);
            const result = await editMessage(formData);
            if (result.success) {
                setEditingMessageId(null);
                setEditingContent("");
                router.refresh();
            }
        }
        catch (error) {
            console.error("Error editing message:", error);
            setError(error instanceof Error ? error.message : "Failed to edit message");
        }
    };
    const handleDeleteMessage = async (messageId) => {
        try {
            const formData = new FormData();
            formData.append("messageId", messageId);
            formData.append("adventureId", adventure.id);
            const result = await deleteMessage(formData);
            if (result.success) {
                router.refresh();
            }
        }
        catch (error) {
            console.error("Error deleting message:", error);
            setError(error instanceof Error ? error.message : "Failed to delete message");
        }
    };
    const startEditing = (messageId, currentContent) => {
        setEditingMessageId(messageId);
        setEditingContent(currentContent);
    };
    const cancelEditing = () => {
        setEditingMessageId(null);
        setEditingContent("");
    };
    return (<div className="flex flex-col h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] p-4">
      <div className="mb-4 flex-shrink-0">
        <h1 className="text-2xl font-bold">{adventure.name}</h1>
        <p className="text-sm text-muted-foreground">
          Playing as {(_a = adventure.adventure_characters[0]) === null || _a === void 0 ? void 0 : _a.name}
        </p>
      </div>

      <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {optimisticMessages.map((message) => {
            const isUserMessage = message.role === "user";
            const isEditing = editingMessageId === message.id;
            const canEdit = !message.isPending && !message.isFailed && !message.tempId;
            return (<div key={message.tempId || message.id} className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}>
                  <Card className={`max-w-[80%] relative ${isUserMessage ? "bg-primary text-primary-foreground" : "bg-muted"} ${message.isPending ? "opacity-70" : ""} ${message.isFailed ? "border-red-500 bg-red-50" : ""}`}>
                    <CardContent className="p-3">
                      
                      {canEdit && !isEditing && (<div className="absolute top-2 right-2 flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => startEditing(message.id, message.content)}>
                            <Edit2 className="h-3 w-3"/>
                          </Button>
                        </div>)}

                      
                      {isEditing && (<div className="absolute top-2 right-2 flex gap-1">
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEditMessage(message.id, editingContent)}>
                            <Check className="h-3 w-3"/>
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => handleDeleteMessage(message.id)}>
                            <X className="h-3 w-3"/>
                          </Button>
                        </div>)}

                      <div className="flex items-start gap-2 pr-8">
                        {isEditing ? (<textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="text-sm flex-1 bg-transparent border border-gray-300 rounded px-2 py-1 resize-none" rows={Math.max(1, editingContent.split("\n").length)} onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleEditMessage(message.id, editingContent);
                        }
                        else if (e.key === "Escape") {
                            cancelEditing();
                        }
                    }}/>) : (<p className="text-sm flex-1">{message.content}</p>)}
                        {message.isPending && (<Loader2 className="h-3 w-3 animate-spin text-muted-foreground"/>)}
                        {message.isFailed && <XCircle className="h-3 w-3 text-red-500"/>}
                        {!message.isPending &&
                    !message.isFailed &&
                    !message.tempId &&
                    !isEditing && (<CheckCircle className="h-3 w-3 text-green-500 opacity-70"/>)}
                      </div>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                        {message.isPending && " • Sending..."}
                        {message.isFailed && " • Failed to send"}
                      </p>
                    </CardContent>
                  </Card>
                </div>);
        })}
            {isGeneratingResponse && (<div className="flex justify-start">
                <Card className="bg-muted">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3 w-3 animate-spin"/>
                      <p className="text-sm">AI is thinking...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>)}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          {error && (<Alert className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>)}
          <div className="flex gap-2">
            <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Type your action or dialogue..." disabled={isLoading} className="flex-1"/>
            <Button onClick={handleSendMessage} disabled={isLoading || isGeneratingResponse} className="min-w-[80px]">
              {isLoading || isGeneratingResponse ? (<Loader2 className="h-4 w-4 animate-spin"/>) : input.trim() ? ("Send") : ("Continue")}
            </Button>
          </div>
        </div>
      </Card>
    </div>);
}
