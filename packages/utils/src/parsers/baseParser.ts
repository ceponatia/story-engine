/**
 * Base Parser Utilities
 *
 * Generic parsing utilities and common patterns.
 */

export interface ParseResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  warnings?: string[];
}

export interface ParserOptions {
  strict?: boolean;
  throwOnError?: boolean;
  ignoreEmpty?: boolean;
  trimWhitespace?: boolean;
}

export abstract class BaseParser<T> {
  protected options: ParserOptions;

  constructor(options: ParserOptions = {}) {
    this.options = {
      strict: false,
      throwOnError: false,
      ignoreEmpty: true,
      trimWhitespace: true,
      ...options,
    };
  }

  /**
   * Abstract parse method to be implemented by subclasses
   */
  abstract parse(input: string): ParseResult<T>;

  /**
   * Parse with error handling
   */
  safeParse(input: string): ParseResult<T> {
    try {
      return this.parse(input);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown parsing error";

      if (this.options.throwOnError) {
        throw error;
      }

      return {
        success: false,
        errors: [errorMessage],
      };
    }
  }

  /**
   * Preprocess input string
   */
  protected preprocessInput(input: string): string {
    if (this.options.trimWhitespace) {
      input = input.trim();
    }

    if (this.options.ignoreEmpty && input === "") {
      return "";
    }

    return input;
  }

  /**
   * Create success result
   */
  protected createSuccessResult(data: T, warnings?: string[]): ParseResult<T> {
    return {
      success: true,
      data,
      warnings,
    };
  }

  /**
   * Create error result
   */
  protected createErrorResult(errors: string[], warnings?: string[]): ParseResult<T> {
    return {
      success: false,
      errors,
      warnings,
    };
  }

  /**
   * Validate required fields
   */
  protected validateRequired(value: unknown, fieldName: string): string | null {
    if (value === undefined || value === null || value === "") {
      return `${fieldName} is required`;
    }
    return null;
  }

  /**
   * Validate string length
   */
  protected validateLength(
    value: string,
    fieldName: string,
    min?: number,
    max?: number
  ): string | null {
    if (min !== undefined && value.length < min) {
      return `${fieldName} must be at least ${min} characters`;
    }
    if (max !== undefined && value.length > max) {
      return `${fieldName} must be no more than ${max} characters`;
    }
    return null;
  }

  /**
   * Extract key-value pairs from text
   */
  protected extractKeyValuePairs(text: string, separator: string = ":"): Record<string, string> {
    const pairs: Record<string, string> = {};
    const lines = text.split(/\n|\r\n|\r/);

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;

      const separatorIndex = trimmedLine.indexOf(separator);
      if (separatorIndex === -1) continue;

      const key = trimmedLine.substring(0, separatorIndex).trim();
      const value = trimmedLine.substring(separatorIndex + 1).trim();

      if (key && value) {
        pairs[key] = value;
      }
    }

    return pairs;
  }

  /**
   * Split and clean array values
   */
  protected splitAndClean(value: string, delimiter: string = ","): string[] {
    return value
      .split(delimiter)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  }

  /**
   * Parse boolean values from string
   */
  protected parseBoolean(value: string): boolean | null {
    const normalized = value.toLowerCase().trim();

    if (["true", "yes", "1", "on", "enabled"].includes(normalized)) {
      return true;
    }

    if (["false", "no", "0", "off", "disabled"].includes(normalized)) {
      return false;
    }

    return null;
  }

  /**
   * Parse number from string with validation
   */
  protected parseNumber(value: string, isInteger: boolean = false): number | null {
    const num = isInteger ? parseInt(value, 10) : parseFloat(value);

    if (isNaN(num)) {
      return null;
    }

    return num;
  }

  /**
   * Extract patterns using regex
   */
  protected extractPattern(text: string, pattern: RegExp): string[] {
    const matches = text.match(pattern);
    return matches || [];
  }

  /**
   * Remove common formatting characters
   */
  protected removeFormatting(text: string): string {
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, "") // Remove zero-width characters
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }
}
