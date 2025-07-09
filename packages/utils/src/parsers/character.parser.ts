/**
 * Character-specific parsing utilities
 */

import { BaseParser, ParseResult } from "./baseParser";

export interface AppearanceData {
  height?: string;
  weight?: string;
  build?: string;
  hair?: string;
  eyes?: string;
  skin?: string;
  features?: string[];
  clothing?: string;
  accessories?: string[];
}

export interface PersonalityData {
  traits?: string[];
  strengths?: string[];
  weaknesses?: string[];
  fears?: string[];
  desires?: string[];
  habits?: string[];
  quirks?: string[];
}

export interface ScentsData {
  natural?: string;
  perfume?: string;
  soap?: string;
  cologne?: string;
  other?: string[];
}

class AppearanceParser extends BaseParser<AppearanceData> {
  parse(input: string): ParseResult<AppearanceData> {
    const processed = this.preprocessInput(input);
    if (!processed) {
      return this.createSuccessResult({});
    }

    const data: AppearanceData = {};
    const keyValuePairs = this.extractKeyValuePairs(processed);

    // Parse common appearance attributes
    if (keyValuePairs.height) data.height = keyValuePairs.height;
    if (keyValuePairs.weight) data.weight = keyValuePairs.weight;
    if (keyValuePairs.build) data.build = keyValuePairs.build;
    if (keyValuePairs.hair) data.hair = keyValuePairs.hair;
    if (keyValuePairs.eyes) data.eyes = keyValuePairs.eyes;
    if (keyValuePairs.skin) data.skin = keyValuePairs.skin;
    if (keyValuePairs.clothing) data.clothing = keyValuePairs.clothing;

    // Parse arrays
    if (keyValuePairs.features) {
      data.features = this.splitAndClean(keyValuePairs.features);
    }
    if (keyValuePairs.accessories) {
      data.accessories = this.splitAndClean(keyValuePairs.accessories);
    }

    return this.createSuccessResult(data);
  }
}

class PersonalityParser extends BaseParser<PersonalityData> {
  parse(input: string): ParseResult<PersonalityData> {
    const processed = this.preprocessInput(input);
    if (!processed) {
      return this.createSuccessResult({});
    }

    const data: PersonalityData = {};
    const keyValuePairs = this.extractKeyValuePairs(processed);

    // Parse personality arrays
    if (keyValuePairs.traits) {
      data.traits = this.splitAndClean(keyValuePairs.traits);
    }
    if (keyValuePairs.strengths) {
      data.strengths = this.splitAndClean(keyValuePairs.strengths);
    }
    if (keyValuePairs.weaknesses) {
      data.weaknesses = this.splitAndClean(keyValuePairs.weaknesses);
    }
    if (keyValuePairs.fears) {
      data.fears = this.splitAndClean(keyValuePairs.fears);
    }
    if (keyValuePairs.desires) {
      data.desires = this.splitAndClean(keyValuePairs.desires);
    }
    if (keyValuePairs.habits) {
      data.habits = this.splitAndClean(keyValuePairs.habits);
    }
    if (keyValuePairs.quirks) {
      data.quirks = this.splitAndClean(keyValuePairs.quirks);
    }

    return this.createSuccessResult(data);
  }
}

class ScentsParser extends BaseParser<ScentsData> {
  parse(input: string): ParseResult<ScentsData> {
    const processed = this.preprocessInput(input);
    if (!processed) {
      return this.createSuccessResult({});
    }

    const data: ScentsData = {};
    const keyValuePairs = this.extractKeyValuePairs(processed);

    // Parse scent attributes
    if (keyValuePairs.natural) data.natural = keyValuePairs.natural;
    if (keyValuePairs.perfume) data.perfume = keyValuePairs.perfume;
    if (keyValuePairs.soap) data.soap = keyValuePairs.soap;
    if (keyValuePairs.cologne) data.cologne = keyValuePairs.cologne;

    // Parse other scents as array
    if (keyValuePairs.other) {
      data.other = this.splitAndClean(keyValuePairs.other);
    }

    return this.createSuccessResult(data);
  }
}

// Parser instances
const appearanceParser = new AppearanceParser();
const personalityParser = new PersonalityParser();
const scentsParser = new ScentsParser();

// Export parsing functions
export function parseAppearanceText(text: string): AppearanceData {
  const result = appearanceParser.parse(text);
  return result.data || {};
}

export function parsePersonalityText(text: string): PersonalityData {
  const result = personalityParser.parse(text);
  return result.data || {};
}

export function parseScentsText(text: string): ScentsData {
  const result = scentsParser.parse(text);
  return result.data || {};
}
