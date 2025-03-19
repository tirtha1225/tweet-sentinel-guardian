
import React from "react";
import { 
  BarChart, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Zap, 
  Clock, 
  LineChart,
  TrendingUp,
  Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StatisticsPanelProps {
  stats: {
    totalTweets: number;
    flaggedTweets: number;
    approvedTweets: number;
    rejectedTweets: number;
    avgResponseTime: string;
    responseRate: number;
    chartData: {
      name: string;
      flagged: number;
      approved: number;
      rejected: number;
    }[];
    categories: {
      name: string;
      count: number;
      color: string;
    }[];
  };
}

const StatisticsPanel: React.FC<StatisticsPanelProps> = ({ stats }) => {
  const statCards = [
    {
      title: "Total Tweets",
      value: stats.totalTweets,
      icon: <BarChart className="h-4 w-4" />,
      trendValue: "+5%",
      trendUp: true,
      bgClass: "bg-blue-light/10",
      iconClass: "text-blue-light",
    },
    {
      title: "Flagged",
      value: stats.flaggedTweets,
      icon: <AlertTriangle className="h-4 w-4" />,
      trendValue: "-2%",
      trendUp: false,
      bgClass: "bg-yellow-light/10",
      iconClass: "text-yellow-DEFAULT",
    },
    {
      title: "Approved",
      value: stats.approvedTweets,
      icon: <CheckCircle className="h-4 w-4" />,
      trendValue: "+8%",
      trendUp: true,
      bgClass: "bg-green-light/10",
      iconClass: "text-green-DEFAULT",
    },
    {
      title: "Rejected",
      value: stats.rejectedTweets,
      icon: <XCircle className="h-4 w-4" />,
      trendValue: "+3%",
      trendUp: true,
      bgClass: "bg-red-light/10",
      iconClass: "text-red-DEFAULT",
    },
  ];

  return (
    <div className="glass-panel p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Moderation Insights</h2>
        <div className="text-xs bg-blue-light/10 text-blue-light rounded-full px-2 py-0.5 flex items-center">
          <LineChart className="h-3 w-3 mr-1" />
          <span>Real-time</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="glass-panel-sm p-3 md:p-4 flex flex-col"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={cn("p-1.5 rounded-md", card.bgClass)}>
                <div className={card.iconClass}>{card.icon}</div>
              </div>
              <div
                className={cn(
                  "text-xs flex items-center",
                  card.trendUp ? "text-green-DEFAULT" : "text-red-DEFAULT"
                )}
              >
                <TrendingUp
                  className={cn(
                    "h-3 w-3 mr-0.5",
                    !card.trendUp && "transform rotate-180"
                  )}
                />
                {card.trendValue}
              </div>
            </div>
            <p className="text-sm text-neutral-500">{card.title}</p>
            <p className="text-2xl font-semibold mt-1">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel-sm p-4">
          <h3 className="text-sm font-medium mb-2">Response Metrics</h3>
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <div className="flex items-center mb-1">
                <Zap className="h-4 w-4 text-blue-light mr-1" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Response Rate</span>
              </div>
              <p className="text-2xl font-semibold">{stats.responseRate}%</p>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center mb-1">
                <Clock className="h-4 w-4 text-blue-light mr-1" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Avg Time</span>
              </div>
              <p className="text-2xl font-semibold">{stats.avgResponseTime}</p>
            </div>
          </div>
          <div className="relative pt-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-500">Flagged Categories</span>
            </div>
            {stats.categories.map((category, index) => (
              <div key={index} className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs">{category.name}</span>
                  <span className="text-xs">{category.count}</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${(category.count / stats.flaggedTweets) * 100}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel-sm p-4">
          <h3 className="text-sm font-medium mb-4">Weekly Activity</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.chartData}
                margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorFlagged" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffcc00" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#ffcc00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#28cd41" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#28cd41" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff3b30" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#ff3b30" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e7" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e5e5e7' }}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '0.5rem',
                    border: '1px solid rgba(229, 229, 231, 0.5)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  }}
                  labelStyle={{ fontWeight: 500, marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="approved"
                  stroke="#28cd41"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorApproved)"
                />
                <Area
                  type="monotone"
                  dataKey="flagged"
                  stroke="#ffcc00"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFlagged)"
                />
                <Area
                  type="monotone"
                  dataKey="rejected"
                  stroke="#ff3b30"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorRejected)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center space-x-4 mt-2">
            <div className="flex items-center">
              <div className="h-2 w-2 bg-green-DEFAULT rounded-full mr-1"></div>
              <span className="text-xs text-neutral-500">Approved</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-yellow-DEFAULT rounded-full mr-1"></div>
              <span className="text-xs text-neutral-500">Flagged</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-2 bg-red-DEFAULT rounded-full mr-1"></div>
              <span className="text-xs text-neutral-500">Rejected</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel-sm p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-light/10 rounded-full flex items-center justify-center mr-3">
            <Shield className="h-4 w-4 text-blue-light" />
          </div>
          <div>
            <h3 className="text-sm font-medium">AI Moderation Status</h3>
            <p className="text-xs text-neutral-500">Last updated 2 minutes ago</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="h-2 w-2 bg-green-DEFAULT rounded-full mr-2"></div>
          <span className="text-sm">Active</span>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPanel;
