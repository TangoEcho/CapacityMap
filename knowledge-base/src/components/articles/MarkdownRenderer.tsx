import { useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Tooltip, Box } from '@mui/material';
import mermaid from 'mermaid';
import { GlossaryTerm } from '../../types';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

interface MarkdownRendererProps {
  content: string;
  glossaryTerms?: GlossaryTerm[];
}

function MermaidBlock({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const id = `mermaid-${Math.random().toString(36).slice(2)}`;
      mermaid.render(id, code).then(({ svg }) => {
        if (ref.current) ref.current.innerHTML = svg;
      }).catch(() => {
        if (ref.current) ref.current.textContent = 'Diagram rendering error';
      });
    }
  }, [code]);

  return <div ref={ref} className="mermaid-diagram" />;
}

function GlossaryTooltipText({ text, glossaryTerms }: { text: string; glossaryTerms: GlossaryTerm[] }) {
  const termMap = useMemo(() => {
    const map = new Map<string, GlossaryTerm>();
    glossaryTerms.forEach(t => map.set(t.term.toLowerCase(), t));
    return map;
  }, [glossaryTerms]);

  const sortedTerms = useMemo(() =>
    glossaryTerms
      .map(t => t.term)
      .sort((a, b) => b.length - a.length),
    [glossaryTerms]
  );

  if (sortedTerms.length === 0) return <>{text}</>;

  const escaped = sortedTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  const seen = new Set<string>();
  while ((match = regex.exec(text)) !== null) {
    const termLower = match[1].toLowerCase();
    if (seen.has(termLower)) continue;
    seen.add(termLower);

    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const glossaryTerm = termMap.get(termLower);
    if (glossaryTerm) {
      parts.push(
        <Tooltip key={match.index} title={glossaryTerm.definition} arrow>
          <Box
            component="span"
            sx={{
              borderBottom: '1px dashed',
              borderColor: 'primary.main',
              cursor: 'help',
            }}
          >
            {match[1]}
          </Box>
        </Tooltip>
      );
    } else {
      parts.push(match[1]);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts}</>;
}

export default function MarkdownRenderer({ content, glossaryTerms = [] }: MarkdownRendererProps) {
  return (
    <Box className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const codeString = String(children).replace(/\n$/, '');

            if (match && match[1] === 'mermaid') {
              return <MermaidBlock code={codeString} />;
            }

            if (match) {
              return (
                <pre>
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              );
            }

            return <code className={className} {...props}>{children}</code>;
          },
          p({ children }) {
            if (glossaryTerms.length === 0) return <p>{children}</p>;
            return (
              <p>
                {Array.isArray(children)
                  ? children.map((child, i) =>
                      typeof child === 'string' ? (
                        <GlossaryTooltipText key={i} text={child} glossaryTerms={glossaryTerms} />
                      ) : (
                        child
                      )
                    )
                  : typeof children === 'string' ? (
                      <GlossaryTooltipText text={children} glossaryTerms={glossaryTerms} />
                    ) : (
                      children
                    )}
              </p>
            );
          },
          h1({ children, ...props }) {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            return <h1 id={id} {...props}>{children}</h1>;
          },
          h2({ children, ...props }) {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            return <h2 id={id} {...props}>{children}</h2>;
          },
          h3({ children, ...props }) {
            const text = String(children);
            const id = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
            return <h3 id={id} {...props}>{children}</h3>;
          },
        }}
      />
    </Box>
  );
}
