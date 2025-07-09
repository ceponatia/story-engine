import { NextLogo } from "@/components/common/next-logo";
import { BookOpen, Sparkles } from "lucide-react";
export function Hero() {
    return (<div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-center items-center">
        <div className="flex items-center gap-3">
          <BookOpen className="h-12 w-12 text-primary"/>
          <Sparkles className="h-8 w-8 text-primary"/>
        </div>
        <span className="border-l rotate-45 h-6"/>
        <a href="https://nextjs.org/" target="_blank" rel="noreferrer">
          <NextLogo />
        </a>
      </div>
      <h1 className="sr-only">Story Engine - AI-Powered Storytelling Platform</h1>
      <p className="text-3xl lg:text-4xl !leading-tight mx-auto max-w-xl text-center">
        Create immersive stories with{" "}
        <span className="font-bold text-primary">AI-powered characters</span> and{" "}
        <a href="https://nextjs.org/" target="_blank" className="font-bold hover:underline" rel="noreferrer">
          Next.js
        </a>
      </p>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8"/>
    </div>);
}
