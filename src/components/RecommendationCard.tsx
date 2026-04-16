import { Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RecommendationCardProps {
  reasons: string[];
  score: number;
}

export function RecommendationCard({ reasons, score }: RecommendationCardProps) {
  const [expanded, setExpanded] = useState(false);
  const confidence = Math.round(score * 100);

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-3 backdrop-blur-sm">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-2 text-left"
      >
        <Lightbulb className="h-4 w-4 shrink-0 text-fashion-gold" />
        <span className="flex-1 text-xs font-medium text-foreground">
          Why this recommendation?
        </span>
        <span className="rounded-full bg-fashion-sage/20 px-2 py-0.5 text-[10px] font-semibold text-fashion-sage">
          {confidence}% match
        </span>
        {expanded ? (
          <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <ul className="mt-2 space-y-1 border-t border-border/50 pt-2">
              {reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] text-muted-foreground">
                  <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-fashion-gold" />
                  {reason}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
