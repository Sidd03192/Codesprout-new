import Image from "next/image";
import {
  FileTextIcon,
  BarChart3Icon,
  LockIcon,
  Share2Icon,
  SearchIcon,
} from "lucide-react";

const features = [
  {
    Icon: FileTextIcon,
    name: "The All-in-One AI Toolkit",
    description:
      "Leverage AI to grade assignments, generate summaries, provide instant feedback, and detect plagiarism—all in one place.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-2",
    background: (
      <Image
        src="/ai-toolkit-dashboard.png"
        alt="AI Toolkit"
        width={500}
        height={300}
        className="absolute -right-20 -top-20 w-[400px] h-auto object-contain rounded-lg opacity-20 group-hover:opacity-50 transition-opacity duration-300"
      />
    ),
  },
  {
    Icon: BarChart3Icon,
    name: "Real-time Analytics",
    description: "Track student progress and identify learning gaps.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-1",
    background: (
      <Image
        src="/analytics-dashboard.png"
        alt="Analytics"
        width={500}
        height={300}
        className="absolute -right-10 -bottom-10 w-[200px] h-auto object-contain rounded-lg opacity-20 group-hover:opacity-50 transition-opacity duration-300"
      />
    ),
  },
  {
    Icon: LockIcon,
    name: "Enterprise-Grade Security",
    description: "Protect student data with industry-leading security.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-1",
    background: (
      <Image
        src="/placeholder-s1kxn.png"
        alt="Security"
        width={500}
        height={300}
        className="absolute -left-10 -bottom-10 w-[200px] h-auto object-contain rounded-lg opacity-20 group-hover:opacity-50 transition-opacity duration-300"
      />
    ),
  },
  {
    Icon: Share2Icon,
    name: "Multi-Language Support",
    description: "Native support for Java, Python, C++, and more.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-1",
    background: (
      <Image
        src="/programming-languages-snippets.png"
        alt="Languages"
        width={500}
        height={300}
        className="absolute -right-10 -top-10 w-[200px] h-auto object-contain rounded-lg opacity-20 group-hover:opacity-50 transition-opacity duration-300"
      />
    ),
  },
  {
    Icon: SearchIcon,
    name: "Plagiarism Detection",
    description: "Ensure academic integrity with advanced analysis.",
    href: "#",
    cta: "Learn More",
    className: "md:col-span-1",
    background: (
      <Image
        src="/document-analysis-similarity-interface.png"
        alt="Plagiarism Detection"
        width={500}
        height={300}
        className="absolute -left-10 -top-10 w-[200px] h-auto object-contain rounded-lg opacity-20 group-hover:opacity-50 transition-opacity duration-300"
      />
    ),
  },
];

export default function BentoGrid() {
  return (
    <section id="features">
      <div className=" relative z-10 max-w-[1400px] w-full mx-auto p-10 ">
        <div className="text-center mb-6">
          <h1 className="text-4xl md:text-6xl font-bold leading-snug mb-4 ">
            Finally, an AI That Does
            <span className="bg-[linear-gradient(var(--gradient-brand))] bg-clip-text text-transparent underline">
              {" "}
              Your Homework
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
            Free yourself from the endless cycle of grading and get back to the
            art of teaching with powerful, reliable tools at your side. <br />
            #BeTheCoolTeacher😎
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-fr text-glow-container">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`
                group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800/50 to-zinc-900/50 
                border border-zinc-700/50 p-8 transition-all duration-500 hover:scale-[1.02] 
                hover:shadow-2xl hover:shadow-zinc-900/50 hover:border-zinc-600/50
                ${feature.className}
              `}
            >
              {/* Background Image */}
              <div className="absolute inset-0 overflow-hidden">
                {feature.background}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-zinc-900/20 to-zinc-900/60 group-hover:from-zinc-900/10 group-hover:to-zinc-900/40 transition-all duration-500" />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 group-hover:scale-110 transition-all duration-300">
                    <feature.Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-zinc-100 transition-colors duration-300">
                  {feature.name}
                </h3>

                <p className="text-zinc-300 mb-6 flex-grow group-hover:text-zinc-200 transition-colors duration-300">
                  {feature.description}
                </p>

                <div className="mt-auto">
                  <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white font-medium hover:bg-white/20 hover:scale-105 transition-all duration-300 group-hover:shadow-lg">
                    {feature.cta}
                    <svg
                      className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute  inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
