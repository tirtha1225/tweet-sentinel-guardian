
import React, { useState } from "react";
import { CheckCircle, XCircle, Flag, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tweet } from "@/lib/mockData";

interface TweetCardProps {
  tweet: Tweet;
  onAction: (tweetId: string, action: "approve" | "reject" | "flag") => void;
}

const TweetCard: React.FC<TweetCardProps> = ({ tweet, onAction }) => {
  const [expanded, setExpanded] = useState(false);
  const formattedDate = new Date(tweet.timestamp).toLocaleString();
  
  const handleApprove = () => onAction(tweet.id, "approve");
  const handleReject = () => onAction(tweet.id, "reject");
  const handleFlag = () => onAction(tweet.id, "flag");
  
  const statusColors = {
    approved: "bg-green-500/10 text-green-600 border-green-500",
    rejected: "bg-red-500/10 text-red-600 border-red-500",
    flagged: "bg-yellow-500/10 text-yellow-600 border-yellow-500",
    pending: "bg-blue-500/10 text-blue-600 border-blue-500"
  };
  
  const getSourceBadge = () => {
    if (!tweet.source || tweet.source === "manual") {
      return (
        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500">
          Manual
        </Badge>
      );
    }
    
    if (tweet.source === "twitter") {
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500">
          Twitter
        </Badge>
      );
    }
    
    return (
      <Badge variant="outline">
        {tweet.source}
      </Badge>
    );
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-4 mb-4 relative"
    >
      <div className="flex items-start">
        <img
          src={tweet.profileImage}
          alt={`${tweet.name}'s profile`}
          className="w-10 h-10 rounded-full mr-3 object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div>
              <span className="font-medium text-sm">{tweet.name}</span>
              <span className="text-neutral-500 text-xs ml-1">@{tweet.username}</span>
            </div>
            <div className="flex items-center space-x-2">
              {getSourceBadge()}
              <Badge variant="outline" className={statusColors[tweet.status]}>
                {tweet.status.charAt(0).toUpperCase() + tweet.status.slice(1)}
              </Badge>
            </div>
          </div>
          <p className="text-sm mb-2 break-words">{tweet.content}</p>
          
          {tweet.image && (
            <img 
              src={tweet.image} 
              alt="Tweet media" 
              className="rounded-md w-full h-auto max-h-48 object-cover mb-2"
            />
          )}
          
          <div className="flex items-center text-xs text-neutral-500">
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-700">
        <div className="flex justify-between items-center">
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "text-xs",
                tweet.status === "approved" && "bg-green-500/10 text-green-600 hover:text-green-700 hover:bg-green-500/20"
              )}
              onClick={handleApprove}
              disabled={tweet.status === "approved"}
            >
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Approve
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "text-xs",
                tweet.status === "rejected" && "bg-red-500/10 text-red-600 hover:text-red-700 hover:bg-red-500/20"
              )}
              onClick={handleReject}
              disabled={tweet.status === "rejected"}
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Reject
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={cn(
                "text-xs",
                tweet.status === "flagged" && "bg-yellow-500/10 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-500/20"
              )}
              onClick={handleFlag}
              disabled={tweet.status === "flagged"}
            >
              <Flag className="h-3.5 w-3.5 mr-1" />
              Flag
            </Button>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="text-xs"
          >
            Analysis
            {expanded ? (
              <ChevronUp className="ml-1 h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="ml-1 h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-1 space-y-3 text-sm">
              {tweet.analysis.explanation && (
                <div>
                  <h4 className="font-medium text-xs uppercase text-neutral-500 mb-1">Analysis</h4>
                  <p className="text-sm bg-neutral-100 dark:bg-neutral-900 p-2 rounded-md">
                    {tweet.analysis.explanation}
                  </p>
                </div>
              )}
              
              <div>
                <h4 className="font-medium text-xs uppercase text-neutral-500 mb-1">Content Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {tweet.analysis.categories.map((category, index) => (
                    <TooltipProvider key={index}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="relative h-7 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-700 flex items-center pr-2">
                            <div
                              className={`h-full ${
                                category.score > 0.7 ? "bg-red-500" :
                                category.score > 0.5 ? "bg-yellow-500" :
                                category.score > 0.3 ? "bg-blue-500" : "bg-green-500"
                              }`}
                              style={{ width: `${Math.max(category.score * 100, 15)}%` }}
                            />
                            <span className="ml-2 text-xs absolute left-2 text-white drop-shadow-md">
                              {category.name}
                            </span>
                            <span className="ml-auto text-xs font-mono">
                              {Math.round(category.score * 100)}%
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{category.explanation || `${category.name} score: ${category.score}`}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ))}
                </div>
              </div>
              
              {tweet.analysis.detectedTopics && tweet.analysis.detectedTopics.length > 0 && (
                <div>
                  <h4 className="font-medium text-xs uppercase text-neutral-500 mb-1">Detected Topics</h4>
                  <div className="flex flex-wrap gap-1">
                    {tweet.analysis.detectedTopics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="bg-blue-500/10 text-blue-600 hover:text-blue-700">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {tweet.analysis.policyReferences && tweet.analysis.policyReferences.length > 0 && (
                <div>
                  <h4 className="font-medium text-xs uppercase text-neutral-500 mb-1">Policy References</h4>
                  <div className="space-y-2">
                    {tweet.analysis.policyReferences.map((policy, index) => (
                      <div key={index} className="bg-neutral-100 dark:bg-neutral-900 p-2 rounded-md">
                        <div className="flex justify-between items-center">
                          <h5 className="font-medium text-xs">{policy.policyName}</h5>
                          <span className="text-xs bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 rounded-full">
                            Relevance: {Math.round(policy.relevance * 100)}%
                          </span>
                        </div>
                        <p className="text-xs mt-1">{policy.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {tweet.analysis.suggestedActions && tweet.analysis.suggestedActions.length > 0 && (
                <div>
                  <h4 className="font-medium text-xs uppercase text-neutral-500 mb-1 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1 text-yellow-500" />
                    Suggested Actions
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {tweet.analysis.suggestedActions.map((action, index) => (
                      <li key={index} className="text-xs">{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TweetCard;
