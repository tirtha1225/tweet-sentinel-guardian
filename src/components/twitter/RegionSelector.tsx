
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface RegionSelectorProps {
  region: string;
  onRegionChange: (region: string) => void;
}

const RegionSelector: React.FC<RegionSelectorProps> = ({
  region,
  onRegionChange,
}) => {
  return (
    <div>
      <label className="text-sm font-medium mb-1 block">Region Filter</label>
      <Select 
        value={region} 
        onValueChange={onRegionChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="us">United States</SelectItem>
          <SelectItem value="worldwide">Worldwide</SelectItem>
          <SelectItem value="eu">Europe</SelectItem>
          <SelectItem value="asia">Asia</SelectItem>
        </SelectContent>
      </Select>
      <p className="text-xs text-neutral-500 mt-1">
        Filter tweets by region to narrow down the stream
      </p>
    </div>
  );
};

export default RegionSelector;
