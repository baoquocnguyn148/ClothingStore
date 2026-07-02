'use client';
import React from 'react';

interface Props {
  content: string;
}

/**
 * Renders simple markdown: **bold**, *italic*, bullet lists, line breaks.
 * Lightweight — no external deps.
 */
export function MarkdownText({ content }: Props) {
  const lines = content.split('\n');

  const renderInline = (text: string, key: number) => {
    const parts: React.ReactNode[] = [];
    const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`)/g;
    let last = 0;
    let m: RegExpExecArray | null;

    while ((m = regex.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      if (m[2]) parts.push(<strong key={m.index}>{m[2]}</strong>);
      else if (m[3]) parts.push(<em key={m.index}>{m[3]}</em>);
      else if (m[4]) parts.push(
        <code key={m.index} className="bg-gray-100 rounded px-1 text-xs font-mono">
          {m[4]}
        </code>
      );
      last = regex.lastIndex;
    }
    if (last < text.length) parts.push(text.slice(last));
    return <span key={key}>{parts}</span>;
  };

  const elements: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={i} className="h-2" />);
    } else if (trimmed.startsWith('## ')) {
      elements.push(
        <p key={i} className="font-semibold text-gray-900 mt-1 mb-0.5 text-sm">
          {renderInline(trimmed.slice(3), i)}
        </p>
      );
    } else if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const bullet = trimmed.slice(2);
      elements.push(
        <div key={i} className="flex items-start gap-1.5 ml-2">
          <span className="text-blue-500 mt-0.5 shrink-0">•</span>
          <span className="text-sm leading-snug">{renderInline(bullet, i)}</span>
        </div>
      );
    } else if (/^\|.+\|$/.test(trimmed)) {
      // Table row — simple text render
      elements.push(
        <p key={i} className="text-xs font-mono text-gray-700 leading-snug">
          {trimmed}
        </p>
      );
    } else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed">
          {renderInline(trimmed, i)}
        </p>
      );
    }
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}
