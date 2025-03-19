
import React, { useState } from "react";
import { Check, X, AlertTriangle, Flag, ThumbsUp, Info, BookOpen, MessageSquare, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tweet } from "@/lib/mockData";
import {
  Alert,
  AlertTitle,
  AlertDescription,
} from "@/components/ui/alert";

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

  const getCategoryColorClass = (score: number) => {
    if (score > 0.7) return "bg-red-DEFAULT";
    if (score > 0.4) return "bg-yellow-DEFAULT";
    return "bg-green-DEFAULT";
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
              {/* AI Explanation */}
              {tweet.analysis.explanation && (
                <Alert className="mb-4 bg-blue-light/5 border-blue-light/20">
                  <HelpCircle className="h-4 w-4 text-blue-light" />
                  <AlertTitle className="text-sm font-medium">AI Analysis</AlertTitle>
                  <AlertDescription className="text-xs">
                    {tweet.analysis.explanation}
                  </AlertDescription>
                </Alert>
              )}
              
              <Accordion type="single" collapsible className="mb-3">
                {/* Content Analysis */}
                <AccordionItem value="content-analysis">
                  <AccordionTrigger className="text-xs font-medium py-2">
                    <div className="flex items-center">
                      <MessageSquare className="h-3.5 w-3.5 mr-2 text-blue-light" />
                      Content Analysis
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 text-sm">
                      {tweet.analysis.categories.map((category, index) => (
                        <div key={index} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600 dark:text-neutral-400">{category.name}</span>
                            <div className="flex items-center">
                              <div className="w-32 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden mr-2">
                                <div 
                                  className={cn(
                                    "h-full",
                                    getCategoryColorClass(category.score)
                                  )}
                                  style={{ width: `${category.score * 100}%` }}
                                />
                              </div>
                              <span className="text-xs">{Math.round(category.score * 100)}%</span>
                            </div>
                          </div>
                          {category.explanation && (
                            <p className="text-xs text-neutral-500 pl-4 border-l-2 border-neutral-200">
                              {category.explanation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                {/* Policy References */}
                {tweet.analysis.policyReferences && tweet.analysis.policyReferences.length > 0 && (
                  <AccordionItem value="policy-references">
                    <AccordionTrigger className="text-xs font-medium py-2">
                      <div className="flex items-center">
                        <BookOpen className="h-3.5 w-3.5 mr-2 text-blue-light" />
                        Related Policies
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {tweet.analysis.policyReferences.map((policy, index) => (
                          <div key={index} className="bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-md border border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-xs font-medium">{policy.policyName}</h4>
                              <span className="text-xs bg-blue-light/10 text-blue-light px-1.5 py-0.5 rounded-full">
                                {Math.round(policy.relevance * 100)}% match
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                              {policy.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {/* Suggested Actions */}
                {tweet.analysis.suggestedActions && tweet.analysis.suggestedActions.length > 0 && (
                  <AccordionItem value="suggested-actions">
                    <AccordionTrigger className="text-xs font-medium py-2">
                      <div className="flex items-center">
                        <Info className="h-3.5 w-3.5 mr-2 text-blue-light" />
                        Suggested Improvements
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="list-disc pl-5 space-y-1">
                        {tweet.analysis.suggestedActions.map((action, index) => (
                          <li key={index} className="text-xs text-neutral-600 dark:text-neutral-400">
                            {action}
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )}
                
                {/* Topics */}
                {tweet.analysis.detectedTopics && tweet.analysis.detectedTopics.length > 0 && (
                  <AccordionItem value="topics">
                    <AccordionTrigger className="text-xs font-medium py-2">
                      <div className="flex items-center">
                        <MessageSquare className="h-3.5 w-3.5 mr-2 text-blue-light" />
                        Detected Topics
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="flex flex-wrap gap-1">
                        {tweet.analysis.detectedTopics.map((topic, index) => (
                          <span 
                            key={index} 
                            className="text-xs bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded-full text-neutral-600 dark:text-neutral-400"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                )}
              </Accordion>
              
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
