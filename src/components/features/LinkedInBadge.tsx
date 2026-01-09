import React from "react";
import { motion } from "framer-motion";
import { Linkedin, Users, Award, MessageSquare, Sparkles } from "lucide-react";
import { useLinkedInStats } from "../../hooks/useLinkedInStats";

interface LinkedInBadgeProps {
  className?: string;
  variant?: "compact" | "expanded";
  profileUrl?: string;
}

const LinkedInBadge: React.FC<LinkedInBadgeProps> = ({
  className = "",
  variant = "expanded",
  profileUrl = "https://linkedin.com/in/ahmedadel1991",
}) => {
  const { connections, followers, endorsements, recommendations, topSkills, headline, loading } =
    useLinkedInStats();

  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  if (variant === "compact") {
    return (
      <motion.a
        href={profileUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0A66C2]/10 border border-[#0A66C2]/30 hover:bg-[#0A66C2]/20 transition-all duration-300 ${className}`}
      >
        <Linkedin className="w-4 h-4 text-[#0A66C2]" />
        <span className="text-sm font-medium text-slate-300">
          {loading ? "..." : `${formatNumber(connections)}+ connections`}
        </span>
      </motion.a>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`relative p-6 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm overflow-hidden ${className}`}
    >
      {/* LinkedIn brand gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A66C2]/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#0A66C2]/20">
            <Linkedin className="w-6 h-6 text-[#0A66C2]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">LinkedIn</h3>
            <p className="text-sm text-slate-400">{headline}</p>
          </div>
        </div>
        <a
          href={profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 text-sm font-medium text-[#0A66C2] bg-[#0A66C2]/10 rounded-lg hover:bg-[#0A66C2]/20 transition-colors"
        >
          Connect
        </a>
      </div>

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Users}
          label="Connections"
          value={connections}
          loading={loading}
          suffix="+"
        />
        <StatCard
          icon={Users}
          label="Followers"
          value={followers}
          loading={loading}
        />
        <StatCard
          icon={Award}
          label="Endorsements"
          value={endorsements}
          loading={loading}
        />
        <StatCard
          icon={MessageSquare}
          label="Recommendations"
          value={recommendations}
          loading={loading}
        />
      </div>

      {/* Top Skills */}
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#0A66C2]" />
          <span className="text-sm font-medium text-slate-400">Top Endorsed Skills</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {topSkills.map((skill, index) => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="px-3 py-1 text-xs font-medium text-[#0A66C2] bg-[#0A66C2]/10 rounded-full border border-[#0A66C2]/20"
            >
              {skill}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  loading: boolean;
  suffix?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, loading, suffix = "" }) => {
  const formatValue = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  return (
    <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
      <Icon className="w-4 h-4 text-slate-500 mb-2" />
      <div className="text-xl font-bold text-white">
        {loading ? (
          <span className="animate-pulse">...</span>
        ) : (
          <>
            {formatValue(value)}
            {suffix && <span className="text-[#0A66C2]">{suffix}</span>}
          </>
        )}
      </div>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
};

export default LinkedInBadge;
