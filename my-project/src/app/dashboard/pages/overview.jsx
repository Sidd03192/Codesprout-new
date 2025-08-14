import React, { useState } from "react";
import {
  LayoutDashboard,
  Book,
  Users,
  BarChart,
  Settings,
  PlusCircle,
  UserPlus,
  ArrowRight,
  Bell,
  CheckCircle,
  AlertCircle,
  PieChart,
} from "lucide-react";

// --- DUMMY DATA ---
const stats = [
  {
    title: "Active Students",
    value: "78",
    change: "+5 this week",
    changeType: "increase",
  },
  {
    title: "Needs Grading",
    value: "12",
    change: "-2 from yesterday",
    changeType: "decrease",
  },
  {
    title: "Average Score",
    value: "88%",
    change: "+1.5% this month",
    changeType: "increase",
  },
  {
    title: "Plagiarism Alerts",
    value: "3",
    change: "No new alerts",
    changeType: "neutral",
  },
];

const recentActivity = [
  {
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    text: "Jane Doe submitted 'Problem Set 5'",
    time: "2m ago",
  },
  {
    icon: <CheckCircle className="w-5 h-5 text-green-400" />,
    text: "John Smith's assignment was auto-graded: 88%",
    time: "15m ago",
  },
  {
    icon: <Bell className="w-5 h-5 text-blue-400" />,
    text: "You have 3 new submissions for 'Final Project'",
    time: "1h ago",
  },
  {
    icon: <AlertCircle className="w-5 h-5 text-yellow-400" />,
    text: "A submission for 'Lab Report 3' was flagged for plagiarism.",
    time: "3h ago",
  },
  {
    icon: <UserPlus className="w-5 h-5 text-purple-400" />,
    text: "5 new students joined 'CS 101'",
    time: "1d ago",
  },
];

const performanceData = {
  labels: ["A", "B", "C", "D/F"],
  datasets: [
    {
      data: [45, 25, 15, 5],
      backgroundColor: ["#34D399", "#60A5FA", "#FBBF24", "#F87171"],
    },
  ],
};

const classSummaries = [
  { name: "CS 101: Intro to Python", students: 32, avgGrade: "A-" },
  { name: "CS 305: Data Structures", students: 24, avgGrade: "B+" },
  { name: "CS 410: Machine Learning", students: 22, avgGrade: "B" },
];

// --- COMPONENTS ---

const StatCard = ({ title, value, change, changeType }) => {
  const changeColor = {
    increase: "text-green-400",
    decrease: "text-red-400",
    neutral: "text-slate-400",
  };

  return (
    <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
      <p className="text-sm text-slate-400 mb-2">{title}</p>
      <p className="text-4xl font-bold text-white">{value}</p>
      <p className={`text-xs mt-2 ${changeColor[changeType]}`}>{change}</p>
    </div>
  );
};

const DashboardView = () => (
  <>
    <header className="mb-8">
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <p className="text-slate-400">
        Welcome back, Dr. Sharma! Here's what's happening today.
      </p>
    </header>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="bg-slate-700/50 p-2 rounded-full">
                {activity.icon}
              </div>
              <div className="flex-grow">
                <p className="text-sm text-slate-300">{activity.text}</p>
              </div>
              <p className="text-xs text-slate-500 flex-shrink-0">
                {activity.time}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-2xl">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors">
            <div className="flex items-center gap-3">
              <PlusCircle className="w-5 h-5" />
              <span className="font-semibold">Create Assignment</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors">
            <div className="flex items-center gap-3">
              <UserPlus className="w-5 h-5" />
              <span className="font-semibold">Invite Students</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors">
            <div className="flex items-center gap-3">
              <BarChart className="w-5 h-5" />
              <span className="font-semibold">View Full Analytics</span>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  </>
);

export const Overview = () => {
  const [activeView, setActiveView] = useState("Dashboard");

  return (
    <div className="bg-slate-950 min-h-screen text-slate-200 font-sans">
      <main className="ml-64 p-8">
        {activeView === "Dashboard" && <DashboardView />}
      </main>
    </div>
  );
};
