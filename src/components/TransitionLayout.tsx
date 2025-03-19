
import React, { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

interface TransitionLayoutProps {
  children: ReactNode;
}

const TransitionLayout: React.FC<TransitionLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("fadeIn");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("fadeOut");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "fadeOut") {
      setTransitionStage("fadeIn");
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={`transition-all duration-300 ${
        transitionStage === "fadeIn" ? "opacity-100" : "opacity-0"
      }`}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
};

export default TransitionLayout;
