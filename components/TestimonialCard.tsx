import type { FC } from 'react';

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
}

const TestimonialCard: FC<TestimonialCardProps> = ({ quote, author, role }) => {
  return (
    <div className="bg-surface p-8 rounded-xl border border-border">
      <p className="text-text-main italic mb-6">"{quote}"</p>
      <div className="flex items-center">
        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary mr-4">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-text-main">{author}</p>
          <p className="text-sm text-text-dim">{role}</p>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;