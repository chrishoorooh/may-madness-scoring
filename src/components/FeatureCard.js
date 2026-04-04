export default function FeatureCard({ emoji, title, description }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-secondary p-6 transition hover:border-primary/50">
      <div className="mb-4 text-4xl">{emoji}</div>
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      <p className="text-foreground/70">{description}</p>
    </div>
  );
}

