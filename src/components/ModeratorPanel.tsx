
import React, { useState } from "react";
import { Filter, RefreshCw, ArrowDownUp, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TweetCard from "./TweetCard";
import { Tweet } from "@/lib/mockData";

interface ModeratorPanelProps {
  tweets: Tweet[];
  onAction: (tweetId: string, action: "approve" | "reject" | "flag") => void;
}

const ModeratorPanel: React.FC<ModeratorPanelProps> = ({ tweets, onAction }) => {
  const [filter, setFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filter tweets based on status and search query
  const filteredTweets = tweets.filter((tweet) => {
    const matchesFilter = filter === "all" || tweet.status === filter;
    const matchesSearch = 
      tweet.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tweet.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tweet.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Sort tweets
  const sortedTweets = [...filteredTweets].sort((a, b) => {
    if (sortOrder === "newest") {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    } else {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    }
  });

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "newest" ? "oldest" : "newest");
  };

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Content Moderation Queue</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFilters}
              className="text-xs"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSortOrder}
              className="text-xs"
            >
              <ArrowDownUp className="h-4 w-4 mr-1" />
              {sortOrder === "newest" ? "Newest" : "Oldest"}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="search"
            placeholder="Search tweets, users, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full bg-neutral-100/50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-700"
          />
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-4 pb-2 flex flex-wrap gap-2">
                <div className="flex-1 min-w-[200px]">
                  <Select
                    value={filter}
                    onValueChange={setFilter}
                  >
                    <SelectTrigger className="w-full h-9 text-sm">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tweets</SelectItem>
                      <SelectItem value="flagged">Flagged</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "px-3 h-9 text-sm",
                      filter === "all" && "bg-blue-light/10 text-blue border-blue-light"
                    )}
                    onClick={() => setFilter("all")}
                  >
                    All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "px-3 h-9 text-sm",
                      filter === "flagged" && "bg-yellow-light/10 text-yellow-dark border-yellow-DEFAULT"
                    )}
                    onClick={() => setFilter("flagged")}
                  >
                    Flagged
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "px-3 h-9 text-sm",
                      filter === "rejected" && "bg-red-light/10 text-red-dark border-red-DEFAULT"
                    )}
                    onClick={() => setFilter("rejected")}
                  >
                    Rejected
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-y-auto pr-2">
        {sortedTweets.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <div className="w-16 h-16 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mb-4">
              <Search className="h-6 w-6 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium mb-1">No tweets found</h3>
            <p className="text-sm text-neutral-500 max-w-sm">
              Try adjusting your search or filter settings to find what you're looking for.
            </p>
          </div>
        ) : (
          sortedTweets.map((tweet) => (
            <TweetCard
              key={tweet.id}
              tweet={tweet}
              onAction={onAction}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ModeratorPanel;
