import React, { useEffect } from "react";
import { Icon } from "@iconify/react";
import { Avatar } from "@heroui/react";
import Image from "next/image";
export const Sidebar = ({ isCollapsed, activePage, setActivePage }) => {
  // Navigation items - updated for teacher dashboard
  const overviewItems = [
    {
      icon: "lucide:layout-dashboard",
      label: "Overview",
      id: "overview",
      isActive: activePage === "overview",
    },
    {
      icon: "lucide:file-text",
      label: "Assignments",
      id: "assignments",
      isActive: activePage === "assignments",
    },
    {
      icon: "lucide:bar-chart-2",
      label: "Gradebook",
      id: "gradebook",
      isActive: activePage === "gradebook",
    },
    {
      icon: "lucide:users",
      label: "Classroom",
      id: "classroom",
      isActive: activePage === "classroom",
    },
    { icon: "lucide:calendar", label: "Schedule", id: "schedule" },
  ];

  const organizationItems = [
    { icon: "lucide:book", label: "Resources" },
    { icon: "lucide:message-square", label: "Messages", badge: 5 },
    { icon: "lucide:bell", label: "Notifications", badge: 2 },
    { icon: "lucide:settings", label: "Settings" },
  ];

  // Dummy classes ( need to connect with supabase)
  const teamItems = [
    {
      id: "math",
      name: "Mathematics 101",
      shortName: "MA",
      color: "bg-blue-600",
    },
    { id: "sci", name: "Science 202", shortName: "SC", color: "bg-purple-600" },
    { id: "eng", name: "English 303", shortName: "EN", color: "bg-green-600" },
  ];

  return (
    <div className="flex h-full flex-col overflow-y-auto border-b ">
      {/* Logo */}
      <div
        className={`mb-4  px-2 ${
          isCollapsed
            ? "flex justify-center"
            : " hover:bg-content2 rounded-2xl cursor-pointer"
        }`}
      >
        {isCollapsed ? (
          <Image src="/2.png" alt="Code Sprout Logo" width={30} height={30} />
        ) : (
          <div className="flex items-center ">
            <div className="flex hover:bg-content2 h-12 w-12 items-center justify-center rounded-full bg-transparent">
              <Image
                src="/2.png"
                alt="Code Sprout Logo"
                width={30}
                height={30}
                className=""
              />
            </div>
            <span className="">Teacher Dashboard</span>
          </div>
        )}
      </div>

      {/* Navigation - Overview */}
      <div className="mb-4 px-2">
        {!isCollapsed && (
          <p className="mb-1 px-3 text-xs font-medium text-foreground-500">
            Dashboard
          </p>
        )}
        <nav>
          {overviewItems.map((item) => (
            <a
              key={item.id || item.label}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (item.id && typeof setActivePage === "function") {
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
                  {item.isNew && <span className="sidebar-item-new">New</span>}
                </>
              )}
            </a>
          ))}
        </nav>
      </div>

      {/* Navigation - Organization */}
      <div className="mb-4 px-2">
        {!isCollapsed && (
          <p className="mb-1 px-3 text-xs font-medium text-foreground-500">
            Tools
          </p>
        )}
        <nav>
          {organizationItems.map((item, index) => (
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

      {/* Classes */}
      <div className="mt-auto px-2">
        {!isCollapsed && (
          <p className="mb-1 px-3 text-xs font-medium text-foreground-500">
            Your Classes
          </p>
        )}
        <nav>
          {teamItems.map((team) => (
            <a
              key={team.id}
              href="#"
              className={`sidebar-item ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className={`team-badge ${team.color}`}>{team.shortName}</div>
              {!isCollapsed && <span>{team.name}</span>}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};
