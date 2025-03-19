
import React from "react";
import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RegionSelectorProps {
  region: string;
  onRegionChange: (value: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({ region, onRegionChange }) => {
  return (
    <div className="mb-4">
      <label className="text-sm font-medium mb-1 block">Region Filter</label>
      <div className="flex items-center space-x-2">
        <Globe className="h-4 w-4 text-neutral-500" />
        <Select value={region} onValueChange={onRegionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select region" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="us">United States</SelectItem>
            <SelectItem value="gb">United Kingdom</SelectItem>
            <SelectItem value="ca">Canada</SelectItem>
            <SelectItem value="au">Australia</SelectItem>
            <SelectItem value="">Global (No filter)</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <p className="text-xs text-neutral-500 mt-1">Filter tweets by region (uses Twitter's place_country parameter)</p>
    </div>
  );
};

export default RegionSelector;
