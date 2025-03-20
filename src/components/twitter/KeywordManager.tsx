
import React from "react";
import { X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface KeywordManagerProps {
  keywords: string[];
  currentKeyword: string;
  onKeywordChange: (keyword: string) => void;
  onAddKeyword: () => void;
  onRemoveKeyword: (keyword: string) => void;
}

const KeywordManager: React.FC<KeywordManagerProps> = ({
  keywords,
  currentKeyword,
  onKeywordChange,
  onAddKeyword,
  onRemoveKeyword,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddKeyword();
  };

  return (
    <div>
      <label className="text-sm font-medium mb-1 block">Keywords</label>
      <form className="flex space-x-2 mb-2" onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Add keyword..."
          value={currentKeyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          className="flex-1"
        />
        <Button 
          type="submit" 
          size="sm"
          disabled={!currentKeyword.trim()}
        >
          Add
        </Button>
      </form>
      
      <div className="flex flex-wrap gap-2 mt-2">
        {keywords.map((keyword) => (
          <Badge key={keyword} variant="secondary" className="py-1 px-2">
            {keyword}
            <X
              className="h-3 w-3 ml-1 cursor-pointer"
              onClick={() => onRemoveKeyword(keyword)}
            />
          </Badge>
        ))}
        {keywords.length === 0 && (
          <p className="text-sm text-neutral-500">No keywords added yet</p>
        )}
      </div>
      <p className="text-xs text-neutral-500 mt-1">
        Add keywords to filter the Twitter stream
      </p>
    </div>
  );
};

export default KeywordManager;
