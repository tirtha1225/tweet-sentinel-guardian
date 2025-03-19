
import React, { useState } from "react";
import { Check, X, AlertTriangle, Flag, ThumbsUp, Info } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tweet } from "@/lib/mockData";

interface TweetCardProps {
  tweet: Tweet;
  onAction: (tweetId: string, action: "approve" | "reject" | "flag") => void;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet, onAction }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "flagged":
        return "bg-yellow-light/20 text-yellow-DEFAULT border border-yellow-DEFAULT/20";
      case "approved":
        return "bg-green-light/20 text-green-DEFAULT border border-green-DEFAULT/20";
      case "rejected":
        return "bg-red-light/20 text-red-DEFAULT border border-red-DEFAULT/20";
      default:
        return "bg-neutral-200 text-neutral-600 border border-neutral-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "flagged":
        return <AlertTriangle className="h-3 w-3" />;
      case "approved":
        return <Check className="h-3 w-3" />;
      case "rejected":
        return <X className="h-3 w-3" />;
      default:
        return <Info className="h-3 w-3" />;
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "premium-card p-4 mb-4 transition-all duration-300",
        isExpanded ? "ring-2 ring-blue-light/30" : ""
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="h-10 w-10 rounded-full overflow-hidden bg-neutral-200 flex-shrink-0">
          <img
            src={tweet.profileImage}
            alt={tweet.username}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center mb-1">
            <p className="font-medium text-sm">{tweet.name}</p>
            <span className="mx-1 text-neutral-400">·</span>
            <p className="text-neutral-500 text-sm">@{tweet.username}</p>
            <div className="ml-auto">
              <span className={cn("status-chip", getStatusColor(tweet.status))}>
                {getStatusIcon(tweet.status)}
                <span className="capitalize">{tweet.status}</span>
              </span>
            </div>
          </div>
          
          <p className="text-sm mb-2">{tweet.content}</p>
          
          {tweet.image && (
            <div className="rounded-lg overflow-hidden mb-3 max-h-48">
              <img
                src={tweet.image}
                alt="Tweet media"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          
          <div className="flex items-center text-xs text-neutral-500">
            <span>{new Date(tweet.timestamp).toLocaleString()}</span>
            <span className="mx-1">·</span>
            <button 
              onClick={toggleExpand} 
              className="text-blue hover:underline"
            >
              {isExpanded ? "Hide details" : "View details"}
            </button>
          </div>
          
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700"
            >
              <div className="mb-3">
                <h4 className="text-xs font-medium text-neutral-500 mb-1">Content Analysis</h4>
                <div className="space-y-1">
                  {tweet.analysis.categories.map((category, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-neutral-600 dark:text-neutral-400">{category.name}</span>
                      <div className="flex items-center">
                        <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mr-2">
                          <div 
                            className={cn(
                              "h-full",
                              category.score > 0.7 ? "bg-red-DEFAULT" : 
                              category.score > 0.4 ? "bg-yellow-DEFAULT" : 
                              "bg-green-DEFAULT"
                            )}
                            style={{ width: `${category.score * 100}%` }}
                          />
                        </div>
                        <span className="text-xs">{Math.round(category.score * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-DEFAULT border-green-DEFAULT/30 hover:bg-green-DEFAULT/10"
                  onClick={() => onAction(tweet.id, "approve")}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-yellow-DEFAULT border-yellow-DEFAULT/30 hover:bg-yellow-DEFAULT/10"
                  onClick={() => onAction(tweet.id, "flag")}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  Flag
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-DEFAULT border-red-DEFAULT/30 hover:bg-red-DEFAULT/10"
                  onClick={() => onAction(tweet.id, "reject")}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TweetCard;
