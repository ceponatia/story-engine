"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, X } from "lucide-react";

interface LibrarySearchProps {
  type: string;
  onSearch?: (query: string) => void;
  onFilter?: (filters: Record<string, string>) => void;
}

const filterOptions: Record<string, { label: string; options: string[] }> = {
  characters: {
    label: "Age Group",
    options: ["All Ages", "Child", "Teen", "Adult", "Elder"],
  },
  settings: {
    label: "Genre",
    options: ["All Genres", "Fantasy", "Sci-Fi", "Modern", "Historical", "Horror"],
  },
  locations: {
    label: "Type",
    options: ["All Types", "Indoor", "Outdoor", "Urban", "Rural", "Mystical"],
  },
};

export function LibrarySearch({ type, onSearch, onFilter }: LibrarySearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilter = (value: string) => {
    setSelectedFilter(value);
    onFilter?.({ [filterOptions[type]?.label.toLowerCase() || "category"]: value });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedFilter("all");
    onSearch?.("");
    onFilter?.({});
  };

  const hasActiveFilters = searchQuery || selectedFilter !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={`Search ${type}...`}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {showFilters && filterOptions[type] && (
        <div className="p-4 bg-muted/50 rounded-lg space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {filterOptions[type].label}
              </label>
              <Select value={selectedFilter} onValueChange={handleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions[type].options.map((option) => (
                    <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}