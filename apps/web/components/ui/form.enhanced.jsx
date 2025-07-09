"use client";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
export function FormInput({ control, name, label, placeholder, type = "text", className, autoComplete, }) {
    return (<FormField control={control} name={name} render={({ field }) => (<FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input placeholder={placeholder} type={type} autoComplete={autoComplete} className={className} {...field}/>
          </FormControl>
          <FormMessage />
        </FormItem>)}/>);
}
export function FormTextarea({ control, name, label, placeholder, className, rows }) {
    return (<FormField control={control} name={name} render={({ field }) => (<FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea placeholder={placeholder} className={className} rows={rows} {...field}/>
          </FormControl>
          <FormMessage />
        </FormItem>)}/>);
}
export function FormSelect({ control, name, label, placeholder = "Select an option...", className, options, }) {
    return (<FormField control={control} name={name} render={({ field }) => (<FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <select className={cn("rounded-md border border-input bg-background px-3 py-2 text-sm", className)} {...field}>
              <option value="">{placeholder}</option>
              {options.map((option) => (<option key={option} value={option}>
                  {option}
                </option>))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>)}/>);
}
