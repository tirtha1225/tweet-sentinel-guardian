
export interface Tweet {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  content: string;
  timestamp: string;
  status: "flagged" | "approved" | "rejected" | "pending";
  image?: string;
  source?: string;
  analysis: {
    categories: {
      name: string;
      score: number;
      explanation?: string;
    }[];
    explanation?: string;
    detectedTopics?: string[];
    policyReferences?: {
      policyName: string;
      relevance: number;
      description: string;
    }[];
    suggestedActions?: string[];
  };
}

// Modify the mock tweets to include explanations
export const mockTweets: Tweet[] = [
  {
    id: "tweet-1",
    name: "Alex Johnson",
    username: "alexj",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Just had the most amazing coffee at that new place downtown! Highly recommend! #coffeelover",
    timestamp: "2023-06-15T14:23:00Z",
    status: "approved",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.01, explanation: "No harassing content detected" },
        { name: "Negativity", score: 0.03, explanation: "Content has a positive sentiment" },
        { name: "Profanity", score: 0.00, explanation: "No profanity detected" },
        { name: "Threats", score: 0.00, explanation: "No threatening language detected" }
      ],
      explanation: "This content is positive and doesn't violate any policies.",
      detectedTopics: ["Food & Drink", "Local Business"]
    }
  },
  {
    id: "tweet-2",
    name: "Taylor Swift",
    username: "taylorswift13",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "I can't believe how terrible the customer service was today. Never going back to that store again! #badservice",
    timestamp: "2023-06-15T12:45:00Z",
    status: "flagged",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.45, explanation: "Contains negative language but not targeted at individuals" },
        { name: "Negativity", score: 0.72, explanation: "Content has negative sentiment toward a business" },
        { name: "Profanity", score: 0.15, explanation: "No explicit profanity but contains strong negative language" },
        { name: "Threats", score: 0.10, explanation: "No direct threats, but contains boycott implications" }
      ],
      explanation: "This content contains strong negative sentiment directed at a business. While criticism is allowed, the tone may violate community guidelines on respectful communication.",
      detectedTopics: ["Customer Service", "Shopping"],
      policyReferences: [
        {
          policyName: "Community Guidelines",
          relevance: 0.6,
          description: "Our platform encourages constructive criticism rather than purely negative content."
        }
      ],
      suggestedActions: [
        "Consider providing specific feedback rather than general negativity",
        "Express disappointment in a more constructive manner"
      ]
    }
  },
  {
    id: "tweet-3",
    name: "Chris Harris",
    username: "chrisharris",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "This politician is completely corrupt and should be locked up! They're destroying our country!",
    timestamp: "2023-06-15T10:12:00Z",
    status: "flagged",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.65, explanation: "Contains accusatory language directed at an individual" },
        { name: "Negativity", score: 0.85, explanation: "Highly negative sentiment without supporting evidence" },
        { name: "Profanity", score: 0.15, explanation: "No explicit profanity but uses charged language" },
        { name: "Threats", score: 0.40, explanation: "Suggests punitive action against an individual" }
      ],
      explanation: "This content makes serious accusations without evidence and calls for punitive action against an individual, which may constitute harassment under our policies.",
      detectedTopics: ["Politics", "Government"],
      policyReferences: [
        {
          policyName: "Harassment Policy",
          relevance: 0.8,
          description: "Content targeting individuals with unsubstantiated accusations may violate our harassment policies."
        },
        {
          policyName: "Political Content Policy",
          relevance: 0.7,
          description: "Political discussion is allowed but must remain respectful and avoid unsubstantiated personal attacks."
        }
      ],
      suggestedActions: [
        "Focus on specific policies rather than personal attacks",
        "Provide factual support for claims",
        "Express political opinions without calling for punitive actions"
      ]
    }
  },
  {
    id: "tweet-4",
    name: "James Wilson",
    username: "jwilson",
    profileImage: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "I'm going to destroy you in the game tomorrow! Been practicing all week for this match.",
    timestamp: "2023-06-14T22:30:00Z",
    status: "approved",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.20, explanation: "Contains competitive language but in a gaming context" },
        { name: "Negativity", score: 0.25, explanation: "Contains aggressive language but in a sporting context" },
        { name: "Profanity", score: 0.05, explanation: "No profanity detected" },
        { name: "Threats", score: 0.35, explanation: "Contains language that could be perceived as threatening but is clearly in the context of a game" }
      ],
      explanation: "While this content contains language that could appear threatening out of context, it's clearly referring to competition in a game, which is allowed under our policies.",
      detectedTopics: ["Gaming", "Sports"]
    }
  },
  {
    id: "tweet-5",
    name: "Emma Thompson",
    username: "emmathompson",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Just watched the latest superhero movie and honestly it was terrible. Such a waste of money and time.",
    timestamp: "2023-06-14T19:45:00Z",
    status: "approved",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.15, explanation: "Criticism directed at content, not individuals" },
        { name: "Negativity", score: 0.65, explanation: "Negative opinion about a creative work" },
        { name: "Profanity", score: 0.05, explanation: "No profanity detected" },
        { name: "Threats", score: 0.00, explanation: "No threatening language detected" }
      ],
      explanation: "This content expresses a negative opinion about a creative work, which is allowed under our content policies as it's not targeting individuals.",
      detectedTopics: ["Entertainment", "Movies"]
    }
  }
];

// Updated to match the StatisticsPanel requirements
export const mockStatistics = {
  totalTweets: 1248,
  approvedTweets: 987,
  rejectedTweets: 53,
  flaggedTweets: 208,
  avgResponseTime: "15s", // Renamed from averageModerationTime
  responseRate: 98, // Added missing property
  chartData: [
    { name: "Mon", flagged: 12, approved: 58, rejected: 3 },
    { name: "Tue", flagged: 19, approved: 65, rejected: 7 },
    { name: "Wed", flagged: 15, approved: 75, rejected: 5 },
    { name: "Thu", flagged: 25, approved: 62, rejected: 9 },
    { name: "Fri", flagged: 18, approved: 80, rejected: 8 },
    { name: "Sat", flagged: 14, approved: 73, rejected: 4 },
    { name: "Sun", flagged: 10, approved: 68, rejected: 2 }
  ], // Added missing property
  categories: [
    { name: "Harassment", count: 87, color: "#ff3b30" },
    { name: "Threats", count: 32, color: "#ff9500" },
    { name: "Profanity", count: 56, color: "#ffcc00" },
    { name: "Misinformation", count: 33, color: "#5856d6" }
  ] // Added missing property
};
