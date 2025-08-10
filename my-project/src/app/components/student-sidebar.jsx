// Add missing imports
import React from "react";
import { Icon } from "@iconify/react";
import { Avatar } from "@heroui/react";

export const Sidebar = ({ isCollapsed, activePage, setActivePage, userType = "teacher" }) => {
  // Teacher navigation items
  const teacherNavItems = [
    { icon: "lucide:layout-dashboard", label: "Overview", id: "overview", isActive: activePage === "overview" },
    { icon: "lucide:file-text", label: "Assignments", id: "assignments", isActive: activePage === "assignments" },
    { icon: "lucide:bar-chart-2", label: "Gradebook", id: "gradebook", isActive: activePage === "gradebook" },
    { icon: "lucide:users", label: "Classroom", id: "classroom", isActive: activePage === "classroom" },
    { icon: "lucide:calendar", label: "Schedule", id: "schedule" },
  ];

  // Student navigation items
  const studentNavItems = [
    { icon: "lucide:layout-dashboard", label: "Overview", id: "overview", isActive: activePage === "overview" },
    { icon: "lucide:file-text", label: "Assignments", id: "assignments", isActive: activePage === "assignments", badge: 3 },
    { icon: "lucide:bar-chart-2", label: "Grades", id: "grades", isActive: activePage === "grades" },
    { icon: "lucide:book", label: "Courses", id: "courses", isActive: activePage === "courses" },
    { icon: "lucide:calendar", label: "Schedule", id: "schedule" },
  ];

  // Teacher tools items
  const teacherToolsItems = [
    { icon: "lucide:book", label: "Resources" },
    { icon: "lucide:message-square", label: "Messages", badge: 5 },
    { icon: "lucide:bell", label: "Notifications", badge: 2 },
    { icon: "lucide:settings", label: "Settings" },
  ];

  // Student tools items
  const studentToolsItems = [
    { icon: "lucide:message-square", label: "Messages", badge: 2 },
    { icon: "lucide:bell", label: "Notifications", badge: 4 },
    { icon: "lucide:help-circle", label: "Help Center" },
    { icon: "lucide:settings", label: "Settings" },
  ];

  // Teacher classes
  const teacherClasses = [
    { id: "math", name: "Mathematics 101", shortName: "MA", color: "bg-blue-600" },
    { id: "sci", name: "Science 202", shortName: "SC", color: "bg-purple-600" },
    { id: "eng", name: "English 303", shortName: "EN", color: "bg-green-600" },
  ];

  // Student courses
  const studentCourses = [
    { id: "math", name: "Mathematics 101", shortName: "MA", color: "bg-blue-600" },
    { id: "sci", name: "Science 202", shortName: "SC", color: "bg-purple-600" },
    { id: "eng", name: "English 303", shortName: "EN", color: "bg-green-600" },
    { id: "his", name: "History 101", shortName: "HI", color: "bg-amber-600" },
    { id: "art", name: "Art & Design", shortName: "AD", color: "bg-pink-600" },
  ];

  // Select the appropriate items based on user type
  const navItems = userType === "teacher" ? teacherNavItems : studentNavItems;
  const toolsItems = userType === "teacher" ? teacherToolsItems : studentToolsItems;
  const courseItems = userType === "teacher" ? teacherClasses : studentCourses;

  return (
    <div className="flex h-full flex-col overflow-y-auto py-4">
      {/* Logo */}
      <div className={`mb-4 px-4 ${isCollapsed ? "flex justify-center" : ""}`}>
        {isCollapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-content3">
            <Icon icon={userType === "teacher" ? "lucide:book-open" : "lucide:graduation-cap"} className="text-foreground" />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-content3">
              <Icon icon={userType === "teacher" ? "lucide:book-open" : "lucide:graduation-cap"} className="text-foreground" />
            </div>
            <span >Student Dashboard</span>
          </div>
        )}
      </div>

      {/* User Profile */}
      <div className={`mb-6 px-4 ${isCollapsed ? "flex justify-center" : ""}`}>
        {isCollapsed ? (
          <Avatar
            src={`https://img.heroui.chat/image/avatar?w=40&h=40&u=${userType === "teacher" ? "teacher1" : "student1"}`}
            className="h-8 w-8"
          />
        ) : (
          <div className="flex items-center gap-2">
            <Avatar
              src={`https://img.heroui.chat/image/avatar?w=40&h=40&u=${userType === "teacher" ? "teacher1" : "student1"}`}
              className="h-10 w-10"
            />
            <div>
              <p className="font-medium">{userType === "teacher" ? "John Doe" : "Alex Johnson"}</p>
              <p className="text-xs text-foreground-500">{userType === "teacher" ? "Science Teacher" : "Student ID: S12345"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mb-4 px-2">
        {!isCollapsed && (
          <p className="mb-1 px-3 text-xs font-medium text-foreground-500">
            Dashboard
          </p>
        )}
        <nav>
          {navItems.map((item) => (
            <a
              key={item.id || item.label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (item.id && typeof setActivePage === 'function') {
                  setActivePage(item.id);
                }
              }}
              className={`sidebar-item ${item.isActive ? "active" : ""} ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <Icon icon={item.icon} className="sidebar-item-icon" />
              {!isCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                  {item.isNew && (
                    <span className="sidebar-item-new">New</span>
                  )}
                </>
              )}
            </a>
          ))}
        </nav>
      </div>

      {/* Tools */}
      <div className="mb-4 px-2">
        {!isCollapsed && (
          <p className="mb-1 px-3 text-xs font-medium text-foreground-500">
            Tools
          </p>
        )}
        <nav>
          {toolsItems.map((item, index) => (
            <a
              key={index}
              href="#"
              className={`sidebar-item ${item.isActive ? "active" : ""} ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              <Icon icon={item.icon} className="sidebar-item-icon" />
              {!isCollapsed && (
                <>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                </>
              )}
            </a>
          ))}
        </nav>
      </div>

      {/* Classes/Courses */}
      <div className="mt-auto px-2">
        {!isCollapsed && (
          <p className="mb-1 px-3 text-xs font-medium text-foreground-500">
            {userType === "teacher" ? "Your Classes" : "Your Courses"}
          </p>
        )}
        <nav>
          {courseItems.map((item) => (
            <a
              key={item.id}
              href="#"
              className={`sidebar-item ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className={`team-badge ${item.color}`}>{item.shortName}</div>
              {!isCollapsed && <span>{item.name}</span>}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};