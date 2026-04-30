/**
 * FormattedOutput — renders AI text with proper markdown-like formatting.
 * Handles: **bold**, numbered lists, bullet lists, section headings (1. Title or ### Title).
 * No external markdown library needed.
 */

interface Props {
  content: string;
  className?: string;
}

function parseLine(line: string, key: number) {
  // Replace **text** with <strong>
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  const nodes = parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-slate-100">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
  return <span key={key}>{nodes}</span>;
}

const FormattedOutput = ({ content, className = '' }: Props) => {
  if (!content) return null;

  const lines = content.split('\n');

  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const trimmed = raw.trim();

    // Skip empty lines — add spacing
    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Section heading: lines like "1. Key Legal Issues" or "## Heading" or "### Heading"
    const numberedHeading = trimmed.match(/^(\d+)\.\s+(.+)$/);
    const hashHeading = trimmed.match(/^#{1,3}\s+(.+)$/);

    if (numberedHeading) {
      elements.push(
        <div key={i} className="mt-4 mb-1 flex items-baseline gap-2">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600/20 border border-purple-500/30 text-purple-400 text-xs font-bold flex items-center justify-center">
            {numberedHeading[1]}
          </span>
          <span className="text-slate-100 font-semibold text-sm">{numberedHeading[2]}</span>
        </div>
      );
      i++;
      continue;
    }

    if (hashHeading) {
      elements.push(
        <p key={i} className="mt-4 mb-1 text-slate-100 font-semibold text-sm border-b border-slate-700/50 pb-1">
          {hashHeading[1]}
        </p>
      );
      i++;
      continue;
    }

    // Bullet point: lines starting with - or *
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      elements.push(
        <div key={i} className="flex gap-2 ml-2 my-0.5">
          <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400/60" />
          <span className="text-slate-300 text-sm leading-relaxed">{parseLine(trimmed.slice(2), i)}</span>
        </div>
      );
      i++;
      continue;
    }

    // Bold-only line (acts as a sub-heading)
    if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
      elements.push(
        <p key={i} className="mt-3 mb-0.5 text-slate-200 font-semibold text-sm">
          {trimmed.slice(2, -2)}
        </p>
      );
      i++;
      continue;
    }

    // Regular paragraph line
    elements.push(
      <p key={i} className="text-slate-300 text-sm leading-relaxed my-0.5">
        {parseLine(trimmed, i)}
      </p>
    );
    i++;
  }

  return (
    <div className={`space-y-0.5 ${className}`}>
      {elements}
    </div>
  );
};

export default FormattedOutput;
