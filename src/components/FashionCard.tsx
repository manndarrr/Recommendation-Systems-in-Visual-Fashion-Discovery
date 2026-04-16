import { Heart } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

interface FashionCardProps {
  id: string;
  name: string;
  image_url: string;
  price: number;
  brand: string;
  category: string;
  style_tags: string[];
  color_tags: string[];
  onLike?: (id: string) => void;
  isLiked?: boolean;
}

export function FashionCard({
  id, name, image_url, price, brand, category, style_tags, onLike, isLiked = false,
}: FashionCardProps) {
  const [liked, setLiked] = useState(isLiked);
  const [imgError, setImgError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-card transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
    >
      <Link to="/item/$itemId" params={{ itemId: id }} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          {!imgError ? (
            <img
              src={image_url}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <span className="text-sm">Image unavailable</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          setLiked(!liked);
          onLike?.(id);
        }}
        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-all hover:bg-background hover:scale-110"
      >
        <Heart
          className={`h-4 w-4 transition-colors ${liked ? "fill-fashion-rose text-fashion-rose" : "text-muted-foreground"}`}
        />
      </button>

      <div className="p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{brand}</p>
        <h3 className="mt-1 font-[var(--font-display)] text-sm font-semibold leading-tight text-foreground">{name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">₹{price.toLocaleString('en-IN')}</span>
          <Badge variant="secondary" className="text-[10px] capitalize">{category}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {style_tags.slice(0, 2).map(tag => (
            <span key={tag} className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-medium capitalize text-accent-foreground">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
