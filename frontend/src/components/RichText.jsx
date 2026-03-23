import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const RichText = ({ content, className = '' }) => {
  if (!content) return null;

  // Basic parser for $$block$$ and $inline$ math 
  // Split by $$...$$
  const blocks = String(content).split(/(\$\$[\s\S]*?\$\$)/g);

  return (
    <div className={`whitespace-pre-wrap ${className}`}>
      {blocks.map((block, i) => {
        // Render Block Math
        if (block.startsWith('$$') && block.endsWith('$$')) {
          const math = block.slice(2, -2);
          return (
            <BlockMath 
              key={i} 
              math={math} 
              renderError={(error) => <span className="text-red-500 bg-red-500/10 px-2 rounded font-mono text-xs">{error.name}: Invalid Math</span>} 
            />
          );
        }

        // Split by $...$ for Inline Math
        const inlines = block.split(/(\$[\s\S]*?\$)/g);
        
        return inlines.map((inline, j) => {
          if (inline.startsWith('$') && inline.endsWith('$')) {
            const math = inline.slice(1, -1);
            return (
              <InlineMath 
                key={`${i}-${j}`} 
                math={math} 
                renderError={(error) => <span className="text-red-500 bg-red-500/10 px-1 rounded font-mono text-xs text-nowrap">Invalid Math</span>} 
              />
            );
          }
          return <span key={`${i}-${j}`}>{inline}</span>;
        });
      })}
    </div>
  );
};

export default RichText;
