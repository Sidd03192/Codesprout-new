import React from "react";
import Editor from "@monaco-editor/react";
import { Icon } from "@iconify/react";
import Countdown from "react-countdown";
import {
  Card,
  Button,
  Tabs,
  Tab,
  Select,
  SelectItem,
  Tooltip,
} from "@heroui/react";
import { RotateCcw, Settings, Save, Play, CloudUpload } from "lucide-react";

export const AssignmentPreview = ({ assignment, onClose }) => {
  console.log("assignment", assignment);
  const isDark = true;
  const title = assignment?.title || "Assignment Preview";
  const description =
    assignment?.description || "<p>No description provided.</p>";
  const codeTemplate =
    assignment?.code_template || "// No code template provided.";
  const language = assignment?.language || "java";
  const [showBanner, setShowBanner] = React.useState(() => {
    // Only show if not closed in this session
    return sessionStorage.getItem("previewBannerClosed") !== "true";
  });
  const handleCloseBanner = () => {
    sessionStorage.setItem("previewBannerClosed", "true");
    setShowBanner(false);
  };
  
  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {showBanner && (
  <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-fit max-w-[90vw]">
    <div className="flex items-center gap-2 bg-red-600 text-white text-xs md:text-sm px-3 py-1.5 rounded-lg shadow-lg border border-red-700 backdrop-blur-sm">
      <Icon icon="lucide:alert-triangle" className="text-white text-sm" />
      <span>You are viewing a preview. This is not published.</span>
      <Button
        isIconOnly
        size="sm"
        variant="light"
        onPress={handleCloseBanner}
        className="ml-1 text-white hover:bg-white/10"
      >
        <Icon icon="lucide:x" className="text-white text-sm" />
      </Button>
    </div>
  </div>
)}
      <Card className="w-full max-w-7xl mx-auto h-[90vh] flex flex-col bg-zinc-900 text-white rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/20">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button isIconOnly variant="light" onPress={onClose}>
            <Icon icon="lucide:x" className="text-white" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel */}
          <div className="w-[45%] flex flex-col border-r border-white/10 bg-zinc-800/40">
            <div className="border-b border-white/10 px-4 py-2">
              <Tabs
                selectedKey="Description"
                aria-label="Tabs"
                color="secondary"
                variant="underlined"
              >
                <Tab key="Description" title="Description" />
              </Tabs>
            </div>
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <div dangerouslySetInnerHTML={{ __html: description }}></div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-[55%] flex flex-col bg-zinc-800/50">
            <div className="flex items-center justify-between px-6 py-2 border-b border-white/10 bg-black/20">
              <Select
                selectedKeys={new Set([language])}
                className="bg-gray-800/60 text-white w-36 rounded-lg"
                size="sm"
                isDisabled
              >
                <SelectItem key="python">🐍 Python</SelectItem>
                <SelectItem key="java">☕ Java</SelectItem>
              </Select>

              <div className="text-sm text-gray-400 font-semibold bg-gray-800/40 px-4 py-2 rounded-lg border border-gray-700/30">
                ⏰ Due in:{" "}
                <span className="text-green-400 font-bold">3d 12h 20m</span>
              </div>

              <div className="flex items-center gap-2">
                <Tooltip content="Reset Code" color="danger">
                  <Button
                    isIconOnly
                    variant="light"
                    size="sm"
                    className="hover:bg-white/10 rounded-xl"
                  >
                    <RotateCcw size={16} className="text-gray-400" />
                  </Button>
                </Tooltip>
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  className="hover:bg-white/10 rounded-xl"
                >
                  <Settings size={16} className="text-gray-400" />
                </Button>
              </div>
            </div>

            <div className="flex-1 bg-black/30 pt-2">
              <Editor
                height="100%"
                language={language}
                value={codeTemplate}
                theme="vs-dark"
                role="teacher"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </div>

            <div className="flex flex-col border-t border-white/10">
              <div className="px-4 pt-2">
                <Tabs
                  selectedKey="console"
                  aria-label="Console"
                  color="secondary"
                  variant="underlined"
                >
                  <Tab
                    key="console"
                    title={
                      <span className="flex items-center gap-2">
                        💻 Console
                      </span>
                    }
                  />
                </Tabs>
              </div>

              <div className="p-6 bg-black/20 flex-1 overflow-y-auto custom-scrollbar">
                <div className="text-gray-200 text-lg">
                  Click "Run Code" to see output here...
                </div>
              </div>

              <div className="flex items-center justify-between px-6 py-4 bg-black/30 border-t border-white/10">
                <div className="text-sm text-gray-400 bg-gray-800/40 px-4 py-2 rounded-lg border border-gray-700/30">
                  ⏱️ 0.00s
                </div>
                <div className="flex items-center gap-4">
                  <Button
                    isDisabled
                    className="opacity-100"
                    startContent={<Play size={16} />}
                    color="secondary"
                    variant="flat"
                  >
                    Run
                  </Button>
                  <Button
                    isDisabled
                    className="opacity-50"
                    startContent={<Save size={16} />}
                    color="primary"
                    variant="flat"
                  >
                    Save
                  </Button>
                  <Button
                    isDisabled
                    className="opacity-50"
                    startContent={<CloudUpload size={16} />}
                    color="success"
                    variant="flat"
                  >
                    Submit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `}</style>
      </Card>
    </div>
  );
};
