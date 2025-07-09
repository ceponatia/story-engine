import * as React from "react";
import type { Control, FieldPath, FieldValues } from "react-hook-form";
interface FormInputProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> {
    control: Control<TFieldValues>;
    name: TName;
    label: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
    className?: string;
    autoComplete?: string;
}
interface FormTextareaProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> {
    control: Control<TFieldValues>;
    name: TName;
    label: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    rows?: number;
}
interface FormSelectProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> {
    control: Control<TFieldValues>;
    name: TName;
    label: string;
    placeholder?: string;
    required?: boolean;
    className?: string;
    options: readonly string[];
}
export declare function FormInput<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ control, name, label, placeholder, type, className, autoComplete, }: FormInputProps<TFieldValues, TName>): React.JSX.Element;
export declare function FormTextarea<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ control, name, label, placeholder, className, rows }: FormTextareaProps<TFieldValues, TName>): React.JSX.Element;
export declare function FormSelect<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ control, name, label, placeholder, className, options, }: FormSelectProps<TFieldValues, TName>): React.JSX.Element;
export {};
//# sourceMappingURL=form.enhanced.d.ts.map