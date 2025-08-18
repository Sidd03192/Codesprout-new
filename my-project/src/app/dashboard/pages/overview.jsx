import {React, useState} from 'react';

import { 
  Users, 
  FileText, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Plus, 
  UserPlus, 
  MessageSquare, 
  FileDown, 
  Calendar,
  Settings,
  BookOpen,
  Pin,
  Clock,
  CheckCircle,
  Eye
} from 'lucide-react';

import {Card, CardBody} from "@heroui/react";

// Analytics Card Component
const AnalyticsCard = ({ title, value, change, icon: Icon, variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-l-4 border-l-green-500';
      case 'warning':
        return 'border-l-4 border-l-amber-500';
      case 'destructive':
        return 'border-l-4 border-l-red-500';
      default:
        return 'border-l-4 border-l-purple-500';
    }
  };

  const getChangeColor = () => {
    if (change?.trend === 'up') return 'text-green-400';
    if (change?.trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendIcon = () => {
    if (change?.trend === 'up') return <TrendingUp className="h-3 w-3" />;
    if (change?.trend === 'down') return <TrendingDown className="h-3 w-3" />;
    return null;
  };

  return (
    <div className={`bg-slate-950 backdrop-blur-sm border border-gray-800/50 rounded-lg p-4 hover:bg-gray-800/30 transition-all duration-200 ${getVariantStyles()}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">{title}</span>
        </div>
      </div>
      
      <div className="space-y-1">
        <div className="text-2xl font-bold text-white">{value}</div>
        {change && (
          <div className={`flex items-center gap-1 text-xs ${getChangeColor()}`}>
            {getTrendIcon()}
            <span>{change.value}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Quick Actions Component
const QuickActions = () => {
  const actions = [
    {
      icon: Plus,
      title: 'Create Assignment',
      description: 'Set up new coursework',
      color: 'blue'
    },
    {
      icon: UserPlus,
      title: 'Invite Students',
      description: 'Add to your classes',
      color: 'green'
    },
    {
      icon: BarChart3,
      title: 'View Analytics',
      description: 'Performance insights',
      color: 'purple'
    },
    {
      icon: MessageSquare,
      title: 'Send Announcement',
      description: 'Notify all students',
      color: 'amber'
    },
    {
      icon: FileDown,
      title: 'Export Data',
      description: 'Download reports',
      color: 'gray'
    },
    {
      icon: Calendar,
      title: 'Schedule Meeting',
      description: 'Office hours & sessions',
      color: 'red'
    },
    {
      icon: BookOpen,
      title: 'Manage Courses',
      description: 'Edit course content',
      color: 'indigo'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'Configure preferences',
      color: 'gray'
    }
  ];

  const getColorClasses = (color) => {
    switch (color) {
      case 'blue':
        return 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10';
      case 'green':
        return 'text-green-400 hover:text-green-300 hover:bg-green-500/10';
      case 'purple':
        return 'text-purple-400 hover:text-purple-300 hover:bg-purple-500/10';
      case 'amber':
        return 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10';
      case 'red':
        return 'text-red-400 hover:text-red-300 hover:bg-red-500/10';
      case 'indigo':
        return 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10';
      default:
        return 'text-gray-400 hover:text-gray-300 hover:bg-gray-500/10';
    }
  };

  return (
    <div className="bg-slate-950 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
        <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
          Customize
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {actions.map((action) => (
          <button
            key={action.title}
            className={`flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-800/50 transition-all duration-200 hover:border-gray-700 hover:scale-105 ${getColorClasses(action.color)}`}
          >
            <action.icon className="h-6 w-6" />
            <div className="text-center">
              <div className="text-xs font-medium text-white mb-1">{action.title}</div>
              <div className="text-xs text-gray-400 leading-tight">{action.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// Announcements Component
const Announcements = () => {
  const announcements = [
    {
      id: '1',
      title: 'Midterm Exam Schedule Released',
      message: 'The midterm examination schedule has been posted. Please review your assigned time slots and prepare accordingly.',
      author: 'Dr. Sharma',
      timestamp: '2 hours ago',
      priority: 'high',
      isPinned: true,
      readBy: 45,
      totalStudents: 78,
      readPercentage: 58
    },
    {
      id: '2',
      title: 'Lab Session Moved to Room 301',
      message: 'Tomorrow\'s lab session will be conducted in Room 301 instead of the usual location due to equipment maintenance.',
      author: 'Dr. Sharma',
      timestamp: '1 day ago',
      priority: 'normal',
      readBy: 32,
      totalStudents: 78,
      readPercentage: 41
    },
    {
      id: '3',
      title: 'Office Hours Extended This Week',
      message: 'Due to upcoming deadlines, office hours will be extended until 6 PM on Wednesday and Thursday.',
      author: 'Dr. Sharma',
      timestamp: '2 days ago',
      priority: 'normal',
      readBy: 28,
      totalStudents: 78,
      readPercentage: 36
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'normal':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      case 'low':
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
      default:
        return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getPriorityDot = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'normal':
        return 'bg-blue-500';
      case 'low':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-slate-950 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Announcements</h3>
        </div>
        <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
          View All
        </button>
      </div>
      
      <div className="space-y-4">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="border border-gray-800/50 rounded-lg p-4 hover:border-gray-700/50 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {announcement.isPinned && <Pin className="h-4 w-4 text-amber-400" />}
                <div className={`w-2 h-2 rounded-full ${getPriorityDot(announcement.priority)}`}></div>
                <h4 className="font-medium text-white">{announcement.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded border ${getPriorityColor(announcement.priority)}`}>
                  {announcement.priority.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 whitespace-nowrap">
                  {announcement.timestamp}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">
              {announcement.message}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>By {announcement.author}</span>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{announcement.readBy}/{announcement.totalStudents}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">{announcement.readPercentage}% read</span>
                <div className="w-16 h-1 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${announcement.readPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Component
const RecentActivity = () => {
  const activities = [
    {
      id: '1',
      type: 'assignment',
      title: 'Math Quiz Submitted',
      description: 'Sarah Chen submitted her assignment',
      timestamp: '2 min ago',
      user: 'Sarah Chen'
    },
    {
      id: '2',
      type: 'plagiarism',
      title: 'Plagiarism Alert',
      description: 'Similarity detected in Essay #3',
      timestamp: '15 min ago',
      user: 'System'
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      description: 'Parent inquiry about homework policy',
      timestamp: '1 hour ago',
      user: 'Mrs. Johnson'
    },
    {
      id: '4',
      type: 'graded',
      title: 'Assignment Graded',
      description: 'Physics Lab Report - Class average: 87%',
      timestamp: '2 hours ago',
      user: 'You'
    },
    {
      id: '5',
      type: 'meeting',
      title: 'Office Hours Scheduled',
      description: 'Student meeting requested for tomorrow',
      timestamp: '3 hours ago',
      user: 'Mike Rodriguez'
    }
  ];

  const getActivityIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <FileText className="h-4 w-4 text-blue-400" />;
      case 'plagiarism':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-green-400" />;
      case 'graded':
        return <CheckCircle className="h-4 w-4 text-purple-400" />;
      case 'meeting':
        return <Calendar className="h-4 w-4 text-amber-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getActivityIndicator = (type) => {
    switch (type) {
      case 'assignment':
        return 'bg-blue-500';
      case 'plagiarism':
        return 'bg-red-500';
      case 'message':
        return 'bg-green-500';
      case 'graded':
        return 'bg-purple-500';
      case 'meeting':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="-mt-5 bg-slate-950 backdrop-blur-sm border border-gray-800/50 rounded-lg h-fit">
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <button className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
            View All
          </button>
        </div>
      </div>
      
      <div className="p-2">
        {activities.map((activity, index) => (
          <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-800/30 rounded-lg transition-colors">
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded-full">
                {getActivityIcon(activity.type)}
              </div>
              {index < activities.length - 1 && (
                <div className="w-px h-6 bg-gray-700"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${getActivityIndicator(activity.type)}`}></div>
                <span className="text-sm font-medium text-white truncate">
                  {activity.title}
                </span>
              </div>
              <p className="text-xs text-gray-400 mb-1">
                {activity.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{activity.user}</span>
                <span className="text-xs text-gray-500">{activity.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const TeacherProfile = () => {
  return (
    <div className="bg-slate-950 backdrop-blur-sm border border-gray-800/50 rounded-lg p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-14 h-14 rounded-full bg-purple-500 flex items-center justify-center text-xl font-bold text-white">
          DS
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Welcome, Dr. Sharma</h3>
          <p className="text-sm text-gray-400">Professor of Computer Science</p>
        </div>
      </div>
      <p className="text-sm text-gray-300 mb-4">
        Dr. Sharma has over 15 years of experience in academia, specializing in
        Artificial Intelligence and Data Science. Dedicated to mentoring students
        and fostering research-driven learning.
      </p>
      <div className="flex flex-col gap-2 text-sm text-gray-400 mb-4">
        <div><span className="font-medium text-gray-300">Email:</span> dr.sharma@university.edu</div>
        <div><span className="font-medium text-gray-300">Office:</span> Room 215, Science Building</div>
        <div><span className="font-medium text-gray-300">Research Interests:</span> AI, ML, NLP</div>
      </div>
      <button className="w-full py-2 text-sm font-medium text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors">
        Logout
      </button>
    </div>
  );
};


// Main Dashboard Overview Component
const DashboardOverview = () => {
  return (
    <div className="bg-transparent -m-6 space-y-6">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsCard
          title="Active Students"
          value="78"
          change={{ value: "+5 this week", trend: "up", timeframe: "" }}
          icon={Users}
          variant="success"
        />
        <AnalyticsCard
          title="Needs Grading"
          value="12"
          change={{ value: "-2 from yesterday", trend: "down", timeframe: "" }}
          icon={FileText}
          variant="warning"
        />
        <AnalyticsCard
          title="Average Score"
          value="88%"
          change={{ value: "+1.5% this month", trend: "up", timeframe: "" }}
          icon={BarChart3}
          variant="success"
        />
        <AnalyticsCard
          title="Plagiarism Alerts"
          value="3"
          change={{ value: "No new alerts", trend: "neutral", timeframe: "" }}
          icon={AlertTriangle}
          variant="destructive"
        />
      </div>

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Center Content Area */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Make Quick Actions tall */}
          <QuickActions />
          <Announcements />
        </div>

        {/* Right Panel - Teacher Profile + Recent Activity */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <TeacherProfile />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export const Overview = () => {
  const [activeView, setActiveView] = useState("Dashboard");

  return (
    <div className="bg-transparent min-h-screen text-slate-200 font-sans">
      <Card className="bg-transparent w-full h-full rounded-xl shadow-lg">
        <CardBody className="w-full h-full p-6">
          {activeView === "Dashboard" && <DashboardOverview />}
        </CardBody>
      </Card>
    </div>
  );
};
