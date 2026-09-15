"use client";

import { useEffect, useState } from "react";

interface TypewriterHeadingProps {
  /** Each entry renders as its own line (like a manual <br/>) */
  lines: string[];
  className?: string;
  /** ms per character */
  speed?: number;
  /** ms before typing starts */
  startDelay?: number;
}

export function TypewriterHeading({
  lines,
  className,
  speed = 42,
  startDelay = 250,
}: TypewriterHeadingProps) {
  const [started, setStarted] = useState(false);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // kick off after the entrance delay
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay);
    return () => clearTimeout(t);
  }, [startDelay]);

  // type character by character, line by line
  useEffect(() => {
    if (!started || lineIndex >= lines.length) return;
    const currentLine = lines[lineIndex];

    if (charIndex < currentLine.length) {
      const t = setTimeout(() => setCharIndex((c) => c + 1), speed);
      return () => clearTimeout(t);
    }

    // small pause at end of line before moving to the next one
    const t = setTimeout(() => {
      setLineIndex((l) => l + 1);
      setCharIndex(0);
    }, speed * 7);
    return () => clearTimeout(t);
  }, [started, charIndex, lineIndex, lines, speed]);

  const isDone = lineIndex >= lines.length;

  return (
    <h1 className={className}>
      {lines.map((line, i) => {
        const text =
          i < lineIndex ? line : i === lineIndex ? line.slice(0, charIndex) : "";
        const showCursor = i === lineIndex && !isDone;

        return (
          <span key={i} className="block">
            {text}
            {showCursor && (
              <span
                className="ml-0.5 inline-block w-[2px] animate-pulse bg-current align-middle"
                style={{ height: "0.85em" }}
              />
            )}
            {/* reserve the line's own space so nothing else jumps while typing */}
            {!showCursor && text === "" && "\u00A0"}
          </span>
        );
      })}
    </h1>
  );
}