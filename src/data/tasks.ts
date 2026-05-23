export interface Task {
  id: string;
  title: string;
  description: string;
  reward: number;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  timeLimit: string;
  status: "available" | "grabbed" | "completed";
  icon: string;
}

export const tasks: Task[] = [
  {
    id: "1",
    title: "Write a Product Review",
    description: "Write a 100-word review for a product",
    reward: 0.50,
    category: "Review",
    difficulty: "Easy",
    timeLimit: "30 min",
    status: "available",
    icon: "📝",
  },
  {
    id: "2",
    title: "Complete a Survey",
    description: "Fill out a market research survey",
    reward: 0.30,
    category: "Survey",
    difficulty: "Easy",
    timeLimit: "15 min",
    status: "available",
    icon: "📋",
  },
  {
    id: "3",
    title: "App Download & Review",
    description: "Download an app and leave a 5-star review",
    reward: 0.80,
    category: "App",
    difficulty: "Medium",
    timeLimit: "1 hour",
    status: "available",
    icon: "📱",
  },
  {
    id: "4",
    title: "Social Media Share",
    description: "Share a post and submit a screenshot",
    reward: 0.25,
    category: "Social",
    difficulty: "Easy",
    timeLimit: "10 min",
    status: "available",
    icon: "📢",
  },
  {
    id: "5",
    title: "Data Entry Task",
    description: "Enter data for 50 products in a spreadsheet",
    reward: 1.50,
    category: "Data Entry",
    difficulty: "Hard",
    timeLimit: "2 hours",
    status: "available",
    icon: "💻",
  },
  {
    id: "6",
    title: "Watch Videos & Earn",
    description: "Watch 3 videos and answer questions",
    reward: 0.20,
    category: "Video",
    difficulty: "Easy",
    timeLimit: "20 min",
    status: "available",
    icon: "🎬",
  },
  {
    id: "7",
    title: "Place an Online Order",
    description: "Order a specific product and earn commission",
    reward: 2.00,
    category: "Order",
    difficulty: "Medium",
    timeLimit: "1 hour",
    status: "available",
    icon: "🛒",
  },
  {
    id: "8",
    title: "Referral Invite",
    description: "Invite 3 friends who sign up successfully",
    reward: 3.00,
    category: "Referral",
    difficulty: "Hard",
    timeLimit: "24 hours",
    status: "available",
    icon: "👥",
  },
];

export const categories = ["All", "Review", "Survey", "App", "Social", "Data Entry", "Video", "Order", "Referral"];
