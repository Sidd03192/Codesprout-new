import React from "react";
import { Card, CardBody, CardHeader, Progress, Avatar } from "@heroui/react";
import { Icon } from "@iconify/react";

export const StudentOverview = () => {
  const stats = [
    { 
      title: "Courses", 
      value: "5", 
      icon: "lucide:book", 
      change: "Current Semester", 
      color: "bg-primary-100 text-primary-500"
    },
    { 
      title: "Assignments", 
      value: "12", 
      icon: "lucide:file-text", 
      change: "3 Due Soon", 
      color: "bg-warning-100 text-warning-500"
    },
    { 
      title: "GPA", 
      value: "3.8", 
      icon: "lucide:bar-chart-2", 
      change: "Current Average", 
      color: "bg-success-100 text-success-500"
    },
    { 
      title: "Attendance", 
      value: "96%", 
      icon: "lucide:calendar-check", 
      change: "This Semester", 
      color: "bg-secondary-100 text-secondary-500"
    }
  ];

  const upcomingAssignments = [
    { title: "Physics Quiz", dueDate: "Today, 3:00 PM", course: "Science 202", status: "urgent" },
    { title: "Essay Draft", dueDate: "Tomorrow, 11:59 PM", course: "English 303", status: "normal" },
    { title: "Problem Set 5", dueDate: "Sep 28", course: "Mathematics 101", status: "normal" },
    { title: "History Report", dueDate: "Oct 1", course: "History 101", status: "upcoming" }
  ];

  const courseProgress = [
    { name: "Mathematics 101", progress: 85, grade: "A-" },
    { name: "Science 202", progress: 72, grade: "B+" },
    { name: "English 303", progress: 93, grade: "A" },
    { name: "History 101", progress: 78, grade: "B" },
    { name: "Art & Design", progress: 90, grade: "A-" }
  ];

  const announcements = [
    { 
      id: 1, 
      title: "Campus Event", 
      content: "Join us for the Fall Festival this weekend on the main quad!", 
      date: "Today", 
      author: "Student Affairs",
      authorAvatar: "https://img.heroui.chat/image/avatar?w=32&h=32&u=admin1"
    },
    { 
      id: 2, 
      title: "Science Lab Closed", 
      content: "The science lab will be closed for maintenance on Thursday.", 
      date: "Yesterday", 
      author: "Facilities Management",
      authorAvatar: "https://img.heroui.chat/image/avatar?w=32&h=32&u=admin2"
    },
    { 
      id: 3, 
      title: "Library Hours Extended", 
      content: "The library will remain open until midnight during finals week.", 
      date: "Sep 22", 
      author: "Library Services",
      authorAvatar: "https://img.heroui.chat/image/avatar?w=32&h=32&u=admin3"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-divider">
            <CardBody className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground-500">{stat.title}</p>
                <h3 className="text-2xl font-semibold mt-1">{stat.value}</h3>
                <p className="text-xs mt-1 text-foreground-500">{stat.change}</p>
              </div>
              <div className={`rounded-full p-3 ${stat.color}`}>
                <Icon icon={stat.icon} className="text-xl" />
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Assignments */}
        <Card className="border border-divider">
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Upcoming Assignments</h3>
            <a href="#" className="text-sm text-primary">View All</a>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {upcomingAssignments.map((assignment, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      assignment.status === 'urgent' ? 'bg-danger' : 
                      assignment.status === 'normal' ? 'bg-primary' : 'bg-default-400'
                    }`}></div>
                    <div>
                      <p className="font-medium">{assignment.title}</p>
                      <p className="text-xs text-foreground-500">{assignment.course}</p>
                    </div>
                  </div>
                  <div className="text-sm text-foreground-500">{assignment.dueDate}</div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Course Progress */}
        <Card className="border border-divider">
          <CardHeader className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Course Progress</h3>
            <a href="#" className="text-sm text-primary">Details</a>
          </CardHeader>
          <CardBody>
            <div className="space-y-5">
              {courseProgress.map((course, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="font-medium">{course.name}</p>
                    <p className="text-sm font-medium">{course.grade}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={course.progress} 
                      color={course.progress > 90 ? "success" : course.progress > 70 ? "primary" : "warning"} 
                      className="h-2 flex-1"
                    />
                    <span className="text-xs text-foreground-500">{course.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Announcements */}
      <Card className="border border-divider">
        <CardHeader className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Announcements</h3>
          <a href="#" className="text-sm text-primary">View All</a>
        </CardHeader>
        <CardBody>
          <div className="space-y-4">
            {announcements.map((announcement) => (
              <Card key={announcement.id} className="border border-divider">
                <CardBody>
                  <div className="flex items-start gap-3">
                    <Avatar src={announcement.authorAvatar} className="h-10 w-10" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{announcement.title}</h3>
                        <span className="text-xs text-foreground-500">{announcement.date}</span>
                      </div>
                      <p className="mt-1 text-sm">{announcement.content}</p>
                      <p className="mt-2 text-xs text-foreground-500">Posted by: {announcement.author}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};