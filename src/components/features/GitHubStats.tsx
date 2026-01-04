import React, { useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useGitHubStats } from "../../hooks/useGitHubStats";
import { GitCommit, GitPullRequest, FolderGit2, Activity } from "lucide-react";

interface AnimatedCounterProps {
  value: number;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  suffix = "",
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 50, stiffness: 400 });
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [motionValue, isInView, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = Math.floor(latest).toLocaleString();
      }
    });
  }, [springValue]);

  return (
    <span className="flex items-center justify-center">
      <span ref={ref}>0</span>
      {suffix && <span className="ml-1 text-emerald-400">{suffix}</span>}
    </span>
  );
};

const GitHubStats: React.FC = () => {
  const { repos, commits, prs, contributions, loading, error } =
    useGitHubStats();

  const statItems = [
    {
      label: "Total Commits",
      value: commits,
      icon: GitCommit,
      suffix: "+",
      color: "from-emerald-400 to-green-500",
    },
    {
      label: "Merged PRs",
      value: prs,
      icon: GitPullRequest,
      suffix: "",
      color: "from-blue-400 to-indigo-500",
    },
    {
      label: "Public Repos",
      value: repos,
      icon: FolderGit2,
      suffix: "",
      color: "from-purple-400 to-pink-500",
    },
    {
      label: "Contributions",
      value: contributions,
      icon: Activity,
      suffix: "+",
      color: "from-orange-400 to-red-500",
    },
  ];

  const contributionsLogos = [
    {
      name: "pip",
      logo: "/images/logos/pip.svg",
      url: "https://github.com/pypa/pip",
      alt: "pip - Python package installer",
    },
    {
      name: "Pydantic",
      logo: "/images/logos/pydantic.svg",
      url: "https://github.com/pydantic/pydantic",
      alt: "Pydantic - Data validation library",
    },
    {
      name: "openai-python",
      logo: "/images/logos/openai.svg",
      url: "https://github.com/openai/openai-python",
      alt: "OpenAI Python SDK",
    },
    {
      name: "OWASP",
      logo: "/images/logos/owasp.svg",
      url: "https://github.com/OWASP",
      alt: "OWASP - Open Web Application Security Project",
    },
  ];

  return (
    <section
      className="relative py-16 md:py-20 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950"
      id="github-stats"
    >
      {/* Background decoration */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <div className="absolute top-0 start-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 end-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Activity className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">
              Open Source Impact
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Building in Public
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto"
          >
            Real-time statistics from my GitHub activity and contributions to
            the open source ecosystem.
          </motion.p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {statItems.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="relative group p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800/80 transition-all duration-300 backdrop-blur-sm"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative z-10 flex flex-col items-center justify-center">
                <div
                  className={`p-3 rounded-full bg-slate-900/50 mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <stat.icon
                    className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`}
                    stroke="url(#gradient)"
                  />
                  {/* Hack for gradient stroke on Lucide icons if simpler color doesn't work, usually text-color works for currentcolor. 
                      Actually, Lucide icons take stroke color. We can use a class or style. 
                      Let's stick to a solid color for the icon to be safe, or use a mask.
                      For simplicity and visibility, I'll use a specific text color class.
                  */}
                  <stat.icon className="w-6 h-6 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </div>

                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {loading ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  )}
                </div>

                <p className="text-sm font-medium text-slate-500 group-hover:text-slate-400 transition-colors">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Project Logos */}
        <div className="relative">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
              Projects I've Contributed To
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {contributionsLogos.map((project, index) => (
              <motion.a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-slate-800/30 transition-all duration-300"
                title={project.alt}
              >
                <div className="relative h-12 w-12 md:h-14 md:w-14 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300">
                  <img
                    src={project.logo}
                    alt={project.alt || `${project.name} logo`}
                    className="w-full h-full object-contain"
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-400 transition-colors">
                  {project.name}
                </span>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Footer Link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <a
            href="https://github.com/aadel"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800/50 border border-slate-700/50 text-sm font-medium text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-all duration-300 group"
          >
            View GitHub Profile
            <GitCommit className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default GitHubStats;
