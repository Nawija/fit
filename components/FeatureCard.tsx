import type { FC, ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

const FeatureCard: FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <div className="bg-surface border border-border p-8 rounded-xl shadow-lg transition-all duration-300 hover:border-primary hover:-translate-y-2">
      <div className="mb-5 inline-block bg-background p-3 rounded-lg border border-border">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-text-main">{title}</h3>
      <p className="text-text-dim">{description}</p>
    </div>
  );
};

export default FeatureCard;