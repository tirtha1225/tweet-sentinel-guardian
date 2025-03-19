
import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface KeywordManagerProps {
  keywords: string[];
  onKeywordsChange: (keywords: string[]) => void;
}

const KeywordManager: React.FC<KeywordManagerProps> = ({ keywords, onKeywordsChange }) => {
  const [keyword, setKeyword] = useState("");

  const handleAddKeyword = () => {
    if (keyword.trim() && !keywords.includes(keyword.trim())) {
      const newKeywords = [...keywords, keyword.trim()];
      onKeywordsChange(newKeywords);
      setKeyword("");
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    const newKeywords = keywords.filter(k => k !== keywordToRemove);
    onKeywordsChange(newKeywords);
  };

  return (
    <div>
      <label className="text-sm font-medium mb-1 block">Keywords to Monitor</label>
      <div className="flex space-x-2 mb-2">
        <Input
          type="text"
          placeholder="Add keyword or hashtag..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddKeyword();
            }
          }}
          className="flex-1"
        />
        <Button 
          type="button"
          size="icon"
          onClick={handleAddKeyword}
          disabled={!keyword.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {keywords.map((kw, index) => (
          <Badge 
            key={index} 
            variant="secondary"
            className="flex items-center space-x-1 py-1"
          >
            <span>{kw}</span>
            <button 
              onClick={() => handleRemoveKeyword(kw)} 
              className="ml-1 h-4 w-4 rounded-full inline-flex items-center justify-center"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
        {keywords.length === 0 && (
          <p className="text-sm text-neutral-500">No keywords added. Add keywords to monitor.</p>
        )}
      </div>
    </div>
  );
};

export default KeywordManager;
