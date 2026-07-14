interface SectionHeaderProps {
  tagline?: string;
  title: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export function SectionHeader({
  tagline,
  title,
  description,
  align = 'center',
  className = '',
}: SectionHeaderProps) {
  const alignment = {
    left: 'text-left',
    center: 'text-center mx-auto',
    right: 'text-right'
  };

  return (
    <div className={`mb-10 max-w-2xl ${alignment[align]} ${className}`}>
      {tagline && (
        <span className="text-xs font-bold uppercase tracking-wider text-[#FF6500] block mb-2">
          {tagline}
        </span>
      )}
      <h2 className="text-3xl font-extrabold tracking-tight text-[#082B5C] sm:text-4xl line-clamp-2 leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-base text-[#172033]/70 leading-relaxed max-w-[70ch] mx-auto">
          {description}
        </p>
      )}
    </div>
  );
}
