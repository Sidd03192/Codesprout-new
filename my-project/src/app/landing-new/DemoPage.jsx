import { Play } from "lucide-react";
import { Button } from "@heroui/react";
import { useState } from "react";

const DemoVideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-16 px-6 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Video Player */}
        <div className="mb-16">
          <div className="relative glass rounded-2xl overflow-hidden aspect-video max-w-4xl mx-auto p-2">
            {!isPlaying && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
                <Button
                  size="lg"
                  className="glass rounded-full w-16 h-16 hover:scale-105 transition-transform"
                  onClick={() => setIsPlaying(true)}
                >
                  <Play className="w-6 h-6 ml-1" fill="currentColor" />
                </Button>
              </div>
            )}

            {isPlaying && (
              <div className="absolute inset-0 bg-black flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-300">Loading video...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Feature Sections */}
        <div className="grid md:grid-cols-2 gap-16">
          {/* Feature 1 */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-white">
                Records your meetings
              </h3>
              <p className="text-gray-400">
                Cluely listens to your meetings in the background and takes
                real-time notes without joining.
              </p>
            </div>
            <div className="glass rounded-2xl aspect-[4/3] flex items-center justify-center p-4">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-900 rounded-lg mb-4 mx-auto flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-600/20 rounded"></div>
                </div>
                <p className="text-sm">Feature image placeholder</p>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-semibold mb-4 text-white">
                Answers in real-time
              </h3>
              <p className="text-gray-400">
                Cluely responds with context of what's happening in a
                conversation and what's on your screen.
              </p>
            </div>
            <div className="glass rounded-2xl aspect-[4/3] flex items-center justify-center p-4">
              <div className="text-center text-gray-400">
                <div className="w-16 h-16 bg-gray-900 rounded-lg mb-4 mx-auto flex items-center justify-center">
                  <div className="w-8 h-8 bg-gray-600/20 rounded"></div>
                </div>
                <p className="text-sm">Feature image placeholder</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DemoVideoSection;
