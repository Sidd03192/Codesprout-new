"use client"

import { motion } from "framer-motion"
import { Wifi, Code, Container, BarChart3, Users, TrendingUp } from "lucide-react"

const features = [
  {
    icon: Wifi,
    title: "Hybrid WebRTC + LAN Broadcast",
    description: "Seamless streaming across local networks and internet connections",
    color: "green",
  },
  {
    icon: Code,
    title: "Embedded Monaco Editor",
    description: "Full IntelliSense support with syntax highlighting and auto-completion",
    color: "purple",
  },
  {
    icon: Container,
    title: "Grading Sandbox",
    description: "Secure auto-grading with isolated execution environments",
    color: "green",
  },
  {
    icon: BarChart3,
    title: "Instant Code Polls & Heat-Maps",
    description: "Real-time student engagement tracking and visualization",
    color: "purple",
  },
  {
    icon: Users,
    title: "Yjs Breakout Collaboration",
    description: "Live collaborative coding sessions with conflict-free editing",
    color: "green",
  },
  {
    icon: TrendingUp,
    title: "Accesss to Future Features",
    description: "We are constantly working on new features and improvements",
    color: "purple",
  },
]

export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black relative overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl" />
      </div>

      {/* Dot Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:20px_20px] dark:bg-[radial-gradient(rgba(34,197,94,0.05)_1px,transparent_1px)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful{" "}
            <span className="bg-gradient-to-r from-green-400 to-purple-400 bg-clip-text text-transparent">
              Features
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Everything you need to create engaging, interactive coding experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{
                scale: 1.05,
                boxShadow:
                  feature.color === "green" ? "0 0 30px rgba(34, 197, 94, 0.3)" : "0 0 30px rgba(168, 85, 247, 0.3)",
              }}
              className="group relative bg-white/80 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-50/50 dark:to-gray-800/20 rounded-xl" />

              <div className="relative z-10">
                <div
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
                    feature.color === "green"
                      ? "bg-green-500/20 text-green-600 dark:text-green-400 group-hover:bg-green-500/30"
                      : "bg-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500/30"
                  } transition-all duration-300`}
                >
                  <feature.icon size={24} />
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>

              <div
                className={`absolute bottom-0 left-0 right-0 h-1 ${
                  feature.color === "green"
                    ? "bg-gradient-to-r from-green-400 to-green-500"
                    : "bg-gradient-to-r from-purple-400 to-purple-500"
                } transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-xl`}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
