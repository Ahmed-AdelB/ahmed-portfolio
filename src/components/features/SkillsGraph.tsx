import React, { useEffect, useState, useMemo, useRef } from 'react';
import { skills } from '../../data/resume';

interface Node {
  id: string;
  name: string;
  group: string;
  val: number;
  color?: string;
}

interface Link {
  source: string;
  target: string;
  color?: string;
}

interface GraphData {
  nodes: Node[];
  links: Link[];
}

type ForceGraphProps = {
  width: number;
  height: number;
  graphData: GraphData;
  nodeLabel: string;
  nodeRelSize: number;
  nodeColor: (node: Node) => string | undefined;
  linkColor: (link: Link) => string | undefined;
  backgroundColor: string;
  d3VelocityDecay: number;
  cooldownTicks: number;
  onNodeClick?: (node: Node) => void;
};

type ForceGraphComponent = React.ComponentType<ForceGraphProps>;

const SkillsGraph: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [isDark, setIsDark] = useState(false);
  const [ForceGraph, setForceGraph] = useState<ForceGraphComponent | null>(null);

  useEffect(() => {
    // specific logic to detect theme
    const checkTheme = () => {
      const isDarkMode = document.documentElement.classList.contains('dark');
      setIsDark(isDarkMode);
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight || 500,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    import('react-force-graph-2d')
      .then((mod) => {
        if (isMounted) {
          setForceGraph(() => mod.default as ForceGraphComponent);
        }
      })
      .catch(() => {
        if (isMounted) {
          setForceGraph(null);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const data: GraphData = useMemo(() => {
    const nodes: Node[] = [];
    const links: Link[] = [];

    // Central Node
    nodes.push({ id: 'Ahmed', name: 'Ahmed', group: 'root', val: 20, color: isDark ? '#10b981' : '#059669' });

    const categories = Object.keys(skills) as Array<keyof typeof skills>;
    
    const categoryColors: Record<string, string> = {
      leadership: '#f59e0b', // Amber
      technical: '#3b82f6', // Blue
      tools: '#8b5cf6', // Violet
      cloud: '#06b6d4', // Cyan
      frameworks: '#ec4899', // Pink
    };

    categories.forEach((category) => {
      const catId = category.charAt(0).toUpperCase() + category.slice(1);
      const color = categoryColors[category] || '#6b7280';
      
      // Category Node
      nodes.push({ 
        id: catId, 
        name: catId, 
        group: 'category', 
        val: 10,
        color: color 
      });
      
      // Link Root -> Category
      links.push({ source: 'Ahmed', target: catId, color: isDark ? '#334155' : '#cbd5e1' });

      // Skill Nodes
      skills[category].forEach((skill) => {
        nodes.push({ 
          id: skill, 
          name: skill, 
          group: 'skill', 
          val: 5,
          color: isDark ? '#e2e8f0' : '#1e293b'
        });
        
        // Link Category -> Skill
        links.push({ source: catId, target: skill, color: isDark ? '#1e293b' : '#e2e8f0' });
      });
    });

    return { nodes, links };
  }, [isDark]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[500px] sm:h-[600px] border border-gray-200/70 dark:border-slate-700/60 rounded-2xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-sm"
    >
      {ForceGraph ? (
        <ForceGraph
          width={dimensions.width}
          height={dimensions.height}
          graphData={data}
          nodeLabel="name"
          nodeRelSize={6}
          nodeColor={(node) => node.color}
          linkColor={(link) => link.color}
          backgroundColor={
            isDark ? 'rgba(15, 23, 42, 0)' : 'rgba(255, 255, 255, 0)'
          }
          d3VelocityDecay={0.3}
          cooldownTicks={100}
          onNodeClick={() => {
            // Placeholder for future interactions.
          }}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-gray-500 dark:text-slate-400">
          Loading skills visualization...
        </div>
      )}
    </div>
  );
};

export default SkillsGraph;
