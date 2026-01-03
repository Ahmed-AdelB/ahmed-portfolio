import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Code, Shield, Terminal, GitPullRequest } from 'lucide-react';

interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  description: string;
}

const experienceData: ExperienceItem[] = [
  {
    role: "AI Security Researcher",
    company: "Independent / Open Source",
    period: "Present",
    description: "Leading research on securing AI infrastructure. Authoring the llm-security-playbook, a comprehensive guide to LLM security. Identifying and responsibly disclosing vulnerabilities in AI tooling."
  },
  {
    role: "Open Source Contributor",
    company: "pip, pydantic, openai-python, OWASP",
    period: "Ongoing",
    description: "7 merged PRs to foundational Python ecosystem projects. Focus on security hardening, input validation, and supply chain protection. Every contribution strengthens the foundation that millions of developers rely on."
  },
  {
    role: "Security Community Member",
    company: "OWASP",
    period: "Ongoing",
    description: "Active contributor to OWASP initiatives focused on AI/ML security. Participating in the development of security standards for the next generation of applications."
  }
];

const getIcon = (role: string) => {
  if (role.includes('Security')) return <Shield className="w-5 h-5" />;
  if (role.includes('Contributor')) return <GitPullRequest className="w-5 h-5" />;
  if (role.includes('Developer')) return <Code className="w-5 h-5" />;
  return <Briefcase className="w-5 h-5" />;
};

const TimelineItem = ({ item, index }: { item: ExperienceItem; index: number }) => {
  return (
    <div className="relative pl-8 sm:pl-32 py-6 group">
      {/* Vertical Line */}
      <div 
        className="hidden sm:flex flex-col items-center absolute left-[8.5rem] top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 group-last:bottom-auto group-last:h-6" 
        aria-hidden="true"
      />
      
      {/* Mobile Vertical Line */}
      <div 
        className="sm:hidden flex flex-col items-center absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 group-last:bottom-auto group-last:h-6" 
        aria-hidden="true"
      />

      {/* Date/Period - Desktop (Left) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="hidden sm:block absolute left-0 w-28 text-right pr-4 pt-1"
      >
        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          {item.period}
        </span>
      </motion.div>

      {/* Icon */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
        className="absolute left-0 sm:left-[8.5rem] w-6 h-6 -ml-3 rounded-full border-4 border-white dark:border-slate-900 bg-emerald-500 text-white flex items-center justify-center shadow-md z-10"
      >
        {getIcon(item.role)}
      </motion.div>

      {/* Content Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, delay: index * 0.2 }}
        className="relative bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300"
      >
        {/* Mobile Date */}
        <span className="sm:hidden inline-block mb-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
          {item.period}
        </span>

        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          {item.role}
        </h3>
        <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm mb-3 flex items-center gap-2">
          {item.company}
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
          {item.description}
        </p>
      </motion.div>
    </div>
  );
};

export default function Timeline() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6">
      <div className="relative">
        {experienceData.map((item, index) => (
          <TimelineItem key={index} item={item} index={index} />
        ))}
      </div>
    </div>
  );
}
