
import React, { useState, useEffect } from "react";
import { PlusCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import Header from "@/components/Header";
import ModeratorPanel from "@/components/ModeratorPanel";
import StatisticsPanel from "@/components/StatisticsPanel";
import TransitionLayout from "@/components/TransitionLayout";
import { moderationService } from "@/lib/moderationService";
import { mockStatistics } from "@/lib/mockData";
import { Tweet } from "@/lib/mockData";

const Index = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [stats, setStats] = useState(mockStatistics);
  const [newTweetContent, setNewTweetContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load initial tweets
    const initialTweets = moderationService.getAllTweets();
    setTweets(initialTweets);

    // Subscribe to tweet updates
    const unsubscribe = moderationService.subscribe(() => {
      setTweets(moderationService.getAllTweets());
      
      // Update stats (in a real app, you'd get this from the backend)
      const approved = moderationService.getTweetsByStatus("approved").length;
      const rejected = moderationService.getTweetsByStatus("rejected").length;
      const flagged = moderationService.getTweetsByStatus("flagged").length;
      
      setStats({
        ...stats,
        approvedTweets: approved,
        rejectedTweets: rejected,
        flaggedTweets: flagged,
        totalTweets: approved + rejected + flagged + moderationService.getTweetsByStatus("pending").length,
      });
    });

    // Simulate real-time updates
    const interval = setInterval(() => {
      const randomContent = [
        "Just had an amazing day at the beach! #sunshine",
        "This new restaurant is absolutely fantastic! #foodie",
        "Can't believe how terrible the service was today. Never going back!",
        "Hey @friend, let's meet up tomorrow for coffee!",
        "This product is a complete scam. Don't waste your money!"
      ];
      
      // Random chance to process a new tweet
      if (Math.random() > 0.7) {
        const randomTweet = randomContent[Math.floor(Math.random() * randomContent.length)];
        moderationService.processTweet(randomTweet);
      }
    }, 30000);

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    
    // Simulate refresh
    setTimeout(() => {
      setTweets(moderationService.getAllTweets());
      setIsLoading(false);
      
      toast({
        title: "Refreshed",
        description: "Content feed has been updated.",
        duration: 2000,
      });
    }, 800);
  };

  const handleTweetAction = async (tweetId: string, action: "approve" | "reject" | "flag") => {
    try {
      await moderationService.updateTweetStatus(tweetId, action === "approve" ? "approved" : action === "reject" ? "rejected" : "flagged");
      
      toast({
        title: "Success",
        description: `Tweet has been ${action}ed.`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tweet status.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSubmitNewTweet = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newTweetContent.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await moderationService.processTweet(newTweetContent);
      
      setNewTweetContent("");
      toast({
        title: "Tweet Submitted",
        description: result.status === "approved" 
          ? "Your tweet has been approved and published." 
          : result.status === "rejected"
          ? "Your tweet has been rejected due to content policy violations."
          : "Your tweet has been flagged for review.",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process tweet.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <TransitionLayout>
      <div className="min-h-screen flex flex-col bg-neutral-100 dark:bg-neutral-900">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 md:px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h1 className="text-3xl font-bold tracking-tight mb-2">Content Moderation</h1>
            <p className="text-neutral-500 dark:text-neutral-400 max-w-3xl">
              Real-time moderation system powered by advanced AI to automatically detect and filter inappropriate content.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="glass-panel p-4 flex items-center justify-between lg:col-span-2"
            >
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-light/10 rounded-full flex items-center justify-center mr-4">
                  <AlertTriangle className="h-5 w-5 text-blue-light" />
                </div>
                <div>
                  <h2 className="text-lg font-medium">Content Review Required</h2>
                  <p className="text-sm text-neutral-500">
                    {stats.flaggedTweets} tweets have been flagged for review
                  </p>
                </div>
              </div>
              <Button 
                size="sm"
                className="bg-blue-light hover:bg-blue-dark text-white"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-1" />
                )}
                Refresh
              </Button>
            </motion.div>
            
            <motion.form 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-panel p-4"
              onSubmit={handleSubmitNewTweet}
            >
              <h2 className="text-lg font-medium mb-2">Test Moderation</h2>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Enter tweet content to test..."
                  value={newTweetContent}
                  onChange={(e) => setNewTweetContent(e.target.value)}
                  className="flex-1"
                  disabled={isSubmitting}
                />
                <Button 
                  type="submit"
                  className="bg-blue-light hover:bg-blue-dark text-white"
                  disabled={isSubmitting || !newTweetContent.trim()}
                >
                  {isSubmitting ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <PlusCircle className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </motion.form>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="lg:col-span-2 h-[calc(100vh-320px)] min-h-[500px]"
            >
              <ModeratorPanel tweets={tweets} onAction={handleTweetAction} />
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="h-[calc(100vh-320px)] min-h-[500px] lg:block"
            >
              <StatisticsPanel stats={stats} />
            </motion.div>
          </div>
        </main>
      </div>
    </TransitionLayout>
  );
};

export default Index;
