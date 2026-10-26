import React from 'react';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

/**
 * Shared layout container for Planora AI.
 * Guarantees uniform max-width and responsive horizontal padding
 * across header, hero, content sections, and footer.
 */
export default function Container({
  children,
  className = '',
  as: Component = 'div',
  ...props
}: ContainerProps) {
  return (
    <Component
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
