interface ArtpopMarkProps {
  compact?: boolean;
}

export default function ArtpopMark({ compact = false }: ArtpopMarkProps) {
  return (
    <span className={`original-logo ${compact ? 'original-logo-compact' : 'original-logo-featured'}`} aria-label="artpop">
      <img src="/artpop-logo-original.png" alt="artpop" />
    </span>
  );
}