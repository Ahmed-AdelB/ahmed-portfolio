/**
 * Mobile Navigation Component
 *
 * A React component with Framer Motion animations for mobile navigation.
 *
 * Features:
 * - Slide-in animation from top
 * - Staggered link animations
 * - Backdrop overlay
 * - Focus trap when open
 * - Keyboard navigation
 * - Active link highlighting
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  User,
  FolderKanban,
  GitPullRequest,
  BookOpen,
  FileText,
  Mail,
  type LucideIcon,
} from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
}

interface MobileNavProps {
  navLinks: NavLink[];
  currentPath: string;
}

// Map labels to icons
const iconMap: Record<string, LucideIcon> = {
  Home: Home,
  About: User,
  Projects: FolderKanban,
  Contributions: GitPullRequest,
  Blog: BookOpen,
  Resume: FileText,
  Contact: Mail,
};

// Animation variants
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const menuVariants = {
  hidden: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
};

export default function MobileNav({ navLinks, currentPath }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Listen for toggle event from Header
  useEffect(() => {
    const handleToggle = (e: CustomEvent<{ isOpen: boolean }>) => {
      setIsOpen(e.detail.isOpen);
    };

    window.addEventListener(
      'toggle-mobile-menu',
      handleToggle as EventListener
    );
    return () => {
      window.removeEventListener(
        'toggle-mobile-menu',
        handleToggle as EventListener
      );
    };
  }, []);

  // Focus management
  useEffect(() => {
    if (isOpen && firstLinkRef.current) {
      // Small delay to allow animation to start
      setTimeout(() => {
        firstLinkRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const links = navRef.current?.querySelectorAll('a');
    if (!links) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = (index + 1) % links.length;
        (links[nextIndex] as HTMLElement).focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = (index - 1 + links.length) % links.length;
        (links[prevIndex] as HTMLElement).focus();
        break;
      case 'Home':
        e.preventDefault();
        (links[0] as HTMLElement).focus();
        break;
      case 'End':
        e.preventDefault();
        (links[links.length - 1] as HTMLElement).focus();
        break;
    }
  };

  // Close menu when clicking a link
  const handleLinkClick = () => {
    setIsOpen(false);
    // Dispatch event to sync with Header button state
    window.dispatchEvent(
      new CustomEvent('toggle-mobile-menu', {
        detail: { isOpen: false },
      })
    );
    // Also update the button state
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    if (mobileMenuButton) {
      mobileMenuButton.setAttribute('aria-expanded', 'false');
      document.getElementById('menu-icon-open')?.classList.remove('hidden');
      document.getElementById('menu-icon-close')?.classList.add('hidden');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 top-16 bg-black/20 dark:bg-black/40 backdrop-blur-sm lg:hidden z-40"
            onClick={handleLinkClick}
            aria-hidden="true"
          />

          {/* Mobile Menu */}
          <motion.nav
            ref={navRef}
            id="mobile-menu"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="lg:hidden absolute top-full inset-x-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-lg z-50"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {navLinks.map((link, index) => {
                const isActive =
                  currentPath === link.href ||
                  (link.href !== '/' && currentPath.startsWith(link.href));
                const Icon = iconMap[link.label] || Home;

                return (
                  <motion.div key={link.href} variants={itemVariants}>
                    <a
                      ref={index === 0 ? firstLinkRef : undefined}
                      href={link.href}
                      onClick={handleLinkClick}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200
                        focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset
                        ${
                          isActive
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        }
                      `}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <Icon
                        size={20}
                        className={`flex-shrink-0 ${
                          isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="font-medium">{link.label}</span>
                      {isActive && (
                        <motion.span
                          layoutId="mobile-active-indicator"
                          className="ms-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"
                          aria-hidden="true"
                        />
                      )}
                    </a>
                  </motion.div>
                );
              })}

              {/* Social Links or Additional Actions */}
              <motion.div
                variants={itemVariants}
                className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center justify-center gap-4 px-4 py-2">
                  {/* GitHub */}
                  <a
                    href="https://github.com/ahmedadel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="GitHub profile (opens in new tab)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>

                  {/* LinkedIn */}
                  <a
                    href="https://linkedin.com/in/ahmedadel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="LinkedIn profile (opens in new tab)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </a>

                  {/* Twitter/X */}
                  <a
                    href="https://twitter.com/ahmedadel"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    aria-label="Twitter profile (opens in new tab)"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            </div>
          </motion.nav>
        </>
      )}
    </AnimatePresence>
  );
}
