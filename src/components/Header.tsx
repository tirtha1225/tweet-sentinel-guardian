
import React from "react";
import { Shield, AlertCircle, BellRing, Settings, Menu, Terminal, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Header: React.FC = () => {
  const { toast } = useToast();

  const showNotification = () => {
    toast({
      title: "Notification",
      description: "You have 3 new tweets flagged for review.",
      duration: 3000,
    });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border-b border-neutral-200/50 dark:border-neutral-800/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6 text-blue-light" />
          <h1 className="text-xl font-semibold tracking-tight">Sentinel</h1>
          <div className="hidden md:flex ml-2 space-x-2">
            <span className="text-xs font-medium px-2 py-0.5 bg-blue-light/10 text-blue-light rounded-full">
              Beta
            </span>
            <span className="text-xs font-medium px-2 py-0.5 bg-purple-light/10 text-purple-DEFAULT rounded-full flex items-center">
              <Cpu className="h-3 w-3 mr-1" />
              AI Powered
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-purple-DEFAULT hover:text-purple-dark hover:bg-purple-light/10"
                >
                  <Terminal className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Explainable AI System</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          <div className="hidden md:flex">
            <Button
              onClick={showNotification}
              variant="ghost"
              size="icon"
              className="relative"
            >
              <BellRing className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-DEFAULT text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </Button>
          </div>
          
          <Button 
            variant="ghost"
            size="icon"
            className="hidden md:flex"
          >
            <Settings className="h-5 w-5" />
          </Button>
          
          <div className="flex md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="hidden md:block">
            <div className="h-8 w-8 rounded-full bg-blue-DEFAULT flex items-center justify-center text-white font-medium">
              AM
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
