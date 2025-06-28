"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  Trash2, 
  Eye,
  User,
  MapPin,
  Calendar
} from "lucide-react";

interface Props {
  item: { 
    id: string; 
    name?: string; 
    title?: string; 
    description?: string;
    age?: number;
    gender?: string;
    tags?: string[];
    created_at?: string;
  };
  type: string;
}

const typeIcons = {
  characters: User,
  settings: MapPin,
  locations: MapPin,
};

export function LibraryCard({ item, type }: Props) {
  const Icon = typeIcons[type as keyof typeof typeIcons] || User;
  const displayName = item.name || item.title || "Untitled";
  const createdDate = item.created_at ? new Date(item.created_at).toLocaleDateString() : null;

  const handleAction = (action: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    switch (action) {
      case 'edit':
        // Navigate to edit page
        window.location.href = `/${type}/${item.id}/edit`;
        break;
      case 'duplicate':
        // Handle duplication
        console.log('Duplicate item:', item.id);
        break;
      case 'delete':
        // Handle deletion
        console.log('Delete item:', item.id);
        break;
    }
  };

  return (
    <Card className="peel-card group hover:shadow-lg transition-all duration-300 border-0 bg-card/60 backdrop-blur">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg line-clamp-1" title={displayName}>
                {displayName}
              </CardTitle>
              {createdDate && (
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  {createdDate}
                </div>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/${type}/${item.id}`} className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction('edit', e)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => handleAction('duplicate', e)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => handleAction('delete', e)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {item.description && (
          <CardDescription className="line-clamp-3 text-sm leading-relaxed">
            {item.description}
          </CardDescription>
        )}
        
        <div className="space-y-2">
          {type === 'characters' && (item.age || item.gender) && (
            <div className="flex gap-2 flex-wrap">
              {item.age && (
                <Badge variant="secondary" className="text-xs">
                  {item.age}
                </Badge>
              )}
              {item.gender && (
                <Badge variant="outline" className="text-xs">
                  {item.gender}
                </Badge>
              )}
            </div>
          )}
          
          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
      
      <Link href={`/${type}/${item.id}`} className="absolute inset-0 z-0" />
    </Card>
  );
}
