
export interface Tweet {
  id: string;
  name: string;
  username: string;
  profileImage: string;
  content: string;
  image?: string;
  timestamp: string;
  status: "flagged" | "approved" | "rejected" | "pending";
  analysis: {
    categories: Array<{
      name: string;
      score: number;
    }>;
    summary?: string;
  };
}

export const mockTweets: Tweet[] = [
  {
    id: "tweet-001",
    name: "Alex Johnson",
    username: "alexj",
    profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Just had the worst customer service experience ever at @TechStore. The staff was rude and unhelpful. Never shopping there again! 😡",
    timestamp: "2023-05-15T14:32:00.000Z",
    status: "flagged",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.25 },
        { name: "Negativity", score: 0.82 },
        { name: "Profanity", score: 0.05 },
        { name: "Threats", score: 0.02 },
      ],
      summary: "This tweet contains strong negative sentiment and brand criticism, but doesn't violate platform policies."
    }
  },
  {
    id: "tweet-002",
    name: "Sarah Miller",
    username: "sarahmil",
    profileImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Excited to announce that my new photography book is now available! Check it out at the link below. #Photography #NewRelease",
    image: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    timestamp: "2023-05-15T16:45:00.000Z",
    status: "approved",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.01 },
        { name: "Negativity", score: 0.02 },
        { name: "Profanity", score: 0.00 },
        { name: "Threats", score: 0.00 },
      ]
    }
  },
  {
    id: "tweet-003",
    name: "Mike Wilson",
    username: "mikewilson",
    profileImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Can someone please tell @InternetProvider to fix their terrible service? I've been without internet for 3 days now! #BadService #Frustrated",
    timestamp: "2023-05-15T10:20:00.000Z",
    status: "pending",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.15 },
        { name: "Negativity", score: 0.68 },
        { name: "Profanity", score: 0.02 },
        { name: "Threats", score: 0.01 },
      ]
    }
  },
  {
    id: "tweet-004",
    name: "Jessica Lee",
    username: "jesslee",
    profileImage: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Anyone know how to get rid of these stupid ads? They're ruining my experience on this platform. Might have to quit soon if this keeps up.",
    timestamp: "2023-05-15T18:12:00.000Z",
    status: "flagged",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.08 },
        { name: "Negativity", score: 0.65 },
        { name: "Profanity", score: 0.20 },
        { name: "Threats", score: 0.02 },
      ]
    }
  },
  {
    id: "tweet-005",
    name: "David Brown",
    username: "dbrown",
    profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Fake news alert! @NewsChannel is spreading lies again. Don't believe anything they say. They're all corrupt!",
    timestamp: "2023-05-15T09:32:00.000Z",
    status: "rejected",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.35 },
        { name: "Negativity", score: 0.78 },
        { name: "Profanity", score: 0.05 },
        { name: "Misinformation", score: 0.85 },
        { name: "Threats", score: 0.03 },
      ]
    }
  },
  {
    id: "tweet-006",
    name: "Emma Taylor",
    username: "emma_t",
    profileImage: "https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Happy birthday to the most amazing friend ever! @LucySmith You make every day brighter. ❤️ #BirthdayLove",
    image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    timestamp: "2023-05-15T20:45:00.000Z",
    status: "approved",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.00 },
        { name: "Negativity", score: 0.00 },
        { name: "Profanity", score: 0.00 },
        { name: "Threats", score: 0.00 },
      ]
    }
  },
  {
    id: "tweet-007",
    name: "Ryan Cooper",
    username: "rcooper",
    profileImage: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "I'm going to destroy everyone who voted for @Politician! You'll all regret it. Watch your backs.",
    timestamp: "2023-05-15T07:18:00.000Z",
    status: "rejected",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.85 },
        { name: "Negativity", score: 0.92 },
        { name: "Profanity", score: 0.10 },
        { name: "Threats", score: 0.88 },
      ]
    }
  },
  {
    id: "tweet-008",
    name: "Olivia Parker",
    username: "oparker",
    profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Just finished this amazing new sci-fi novel! Highly recommend it to anyone who loves the genre. What are you reading right now?",
    timestamp: "2023-05-15T15:50:00.000Z",
    status: "approved",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.00 },
        { name: "Negativity", score: 0.01 },
        { name: "Profanity", score: 0.00 },
        { name: "Threats", score: 0.00 },
      ]
    }
  },
  {
    id: "tweet-009",
    name: "Nicholas Grant",
    username: "ngrant",
    profileImage: "https://images.unsplash.com/photo-1520409364224-63400afe26e5?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Why is no one talking about the side effects of this vaccine? My cousin got it and now has serious health issues. Be careful people! #VaccineAlert",
    timestamp: "2023-05-15T11:27:00.000Z",
    status: "flagged",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.05 },
        { name: "Negativity", score: 0.55 },
        { name: "Profanity", score: 0.00 },
        { name: "Misinformation", score: 0.75 },
        { name: "Threats", score: 0.01 },
      ]
    }
  },
  {
    id: "tweet-010",
    name: "Sophie Allen",
    username: "sallen",
    profileImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
    content: "Just launched my new website! It's been months of hard work, but I'm so proud of the result. Check it out: website.com #WebDesign #Launch",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    timestamp: "2023-05-15T17:05:00.000Z",
    status: "approved",
    analysis: {
      categories: [
        { name: "Harassment", score: 0.00 },
        { name: "Negativity", score: 0.00 },
        { name: "Profanity", score: 0.00 },
        { name: "Threats", score: 0.00 },
      ]
    }
  }
];

export const mockStatistics = {
  totalTweets: 254,
  flaggedTweets: 47,
  approvedTweets: 187,
  rejectedTweets: 20,
  avgResponseTime: "2.4 min",
  responseRate: 94,
  chartData: [
    { name: "Mon", flagged: 12, approved: 45, rejected: 2 },
    { name: "Tue", flagged: 8, approved: 32, rejected: 3 },
    { name: "Wed", flagged: 10, approved: 38, rejected: 5 },
    { name: "Thu", flagged: 5, approved: 42, rejected: 2 },
    { name: "Fri", flagged: 7, approved: 35, rejected: 4 },
    { name: "Sat", flagged: 2, approved: 15, rejected: 1 },
    { name: "Sun", flagged: 3, approved: 12, rejected: 3 },
  ],
  categories: [
    { name: "Harassment", count: 18, color: "#ff3b30" },
    { name: "Misinformation", count: 12, color: "#ffcc00" },
    { name: "Profanity", count: 9, color: "#ff9500" },
    { name: "Threats", count: 8, color: "#ff2d55" },
  ],
};
