
// Expanded policy knowledge base for RAG
export const policyKnowledgeBase = [
  {
    id: "policy-1",
    name: "Harassment Policy",
    description: "Content targeting individuals with intent to harm, bully, or belittle is not allowed. This includes repeated unwanted communications, threats, or content that creates a hostile environment for others.",
    keywords: ["harass", "bully", "attack", "insult", "hate", "target", "mock", "ridicule", "hostile"],
    relevance: 0,
    examples: [
      "Repeated unwanted mentions or replies",
      "Name-calling or personal attacks",
      "Encouraging others to harass someone"
    ]
  },
  {
    id: "policy-2",
    name: "Hate Speech Policy",
    description: "Content promoting hatred, violence or discrimination against protected groups based on attributes such as race, ethnicity, gender, religion, sexual orientation, or disability is prohibited.",
    keywords: ["hate", "racist", "sexist", "bigot", "discriminate", "slur", "stereotype", "intolerant"],
    relevance: 0,
    examples: [
      "Using derogatory terms for specific groups",
      "Promoting stereotypes that dehumanize groups",
      "Calling for violence against protected categories"
    ]
  },
  {
    id: "policy-3",
    name: "Profanity Policy",
    description: "Excessive or targeted profanity that creates a hostile environment is moderated. While occasional mild profanity is permitted, content that uses profanity excessively or specifically to attack others may be flagged.",
    keywords: ["damn", "hell", "profanity", "swear", "curse", "f-word", "obscene", "vulgar"],
    relevance: 0,
    examples: [
      "Excessive use of profanity in a single post",
      "Using profanity specifically to insult others",
      "Bypassing filters with alternate spellings of profane words"
    ]
  },
  {
    id: "policy-4",
    name: "Threat Policy",
    description: "Direct or indirect threats of violence are strictly prohibited. This includes content that expresses a wish for harm to come to individuals or groups, or content that describes specific violent acts against others.",
    keywords: ["kill", "hurt", "destroy", "threat", "violence", "attack", "harm", "bomb", "shoot", "murder", "die"],
    relevance: 0,
    examples: [
      "Threatening physical harm to individuals or groups",
      "Wishing death or injury on others",
      "Describing plans for violent acts"
    ]
  },
  {
    id: "policy-5",
    name: "Misinformation Policy",
    description: "Content that deliberately spreads false information that could cause harm is prohibited. This includes health misinformation, election misinformation, or false information during crises.",
    keywords: ["fake", "lie", "untrue", "conspiracy", "hoax", "false", "mislead", "disinformation", "propaganda"],
    relevance: 0,
    examples: [
      "Spreading known medical falsehoods that could cause harm",
      "Deliberately misrepresenting election processes",
      "Sharing manipulated media presented as authentic"
    ]
  },
  {
    id: "policy-6",
    name: "Self-Harm & Suicide Policy",
    description: "Content that promotes, encourages, or glorifies self-harm or suicide is prohibited. This includes detailed descriptions, instructions, or encouragement of self-harming behaviors.",
    keywords: ["suicide", "self-harm", "kill myself", "cutting", "anorexia", "eating disorder", "end my life"],
    relevance: 0,
    examples: [
      "Encouraging self-harming behaviors",
      "Providing instructions for suicidal actions",
      "Glorifying or romanticizing suicide"
    ]
  },
  {
    id: "policy-7",
    name: "Child Safety Policy",
    description: "Content that sexualizes minors, exploits children, or puts children at risk is strictly prohibited and will be reported to authorities. This includes sexualized comments about minors and content that endangers children.",
    keywords: ["child", "minor", "underage", "kid", "teen", "exploitation", "abuse", "pedophilia"],
    relevance: 0,
    examples: [
      "Sexualized content involving minors",
      "Sharing personal information of minors",
      "Content that endangers the wellbeing of children"
    ]
  },
  {
    id: "policy-8",
    name: "Privacy Violation Policy",
    description: "Sharing someone's private information without consent is prohibited. This includes doxxing, unauthorized sharing of personal photos, or revealing private conversations without permission.",
    keywords: ["dox", "private", "personal", "address", "phone", "email", "leak", "expose", "privacy"],
    relevance: 0,
    examples: [
      "Sharing someone's home address or phone number",
      "Posting screenshots of private conversations",
      "Sharing non-public personal information"
    ]
  },
  {
    id: "policy-9",
    name: "Graphic Content Policy",
    description: "Excessively graphic, gory, or disturbing content must be properly labeled. Extremely graphic content showing gratuitous violence, severe injuries, or death may be removed even with proper warnings.",
    keywords: ["graphic", "gore", "blood", "injury", "death", "disturbing", "violent", "gruesome"],
    relevance: 0,
    examples: [
      "Extremely graphic injury or death images",
      "Gratuitous violence for shock value",
      "Unlabeled disturbing content"
    ]
  },
  {
    id: "policy-10",
    name: "Spam & Manipulation Policy",
    description: "Content that manipulates the platform through inauthentic interactions, excessive posting, or coordinated campaigns is prohibited. This includes artificially boosting engagement and spam.",
    keywords: ["spam", "bot", "fake account", "artificial", "engagement", "manipulation", "coordinated", "amplification"],
    relevance: 0,
    examples: [
      "Posting the same content repeatedly",
      "Using bots to artificially boost engagement",
      "Coordinated harassment campaigns"
    ]
  }
];
