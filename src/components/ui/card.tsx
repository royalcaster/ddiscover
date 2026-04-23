import React from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/utils';

type CardProps = ViewProps & {
  className?: string;
};

const Card = React.forwardRef<React.ElementRef<typeof View>, CardProps>(({ className, ...props }, ref) => (
  <View ref={ref} className={cn('rounded-lg border border-border bg-card', className)} {...props} />
));

const CardHeader = React.forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, ...props }, ref) => <View ref={ref} className={cn('gap-2 p-4', className)} {...props} />,
);

const CardContent = React.forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, ...props }, ref) => <View ref={ref} className={cn('gap-3 px-4 pb-4', className)} {...props} />,
);

const CardFooter = React.forwardRef<React.ElementRef<typeof View>, CardProps>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn('flex-row items-center gap-2 px-4 pb-4', className)} {...props} />
  ),
);

Card.displayName = 'Card';
CardHeader.displayName = 'CardHeader';
CardContent.displayName = 'CardContent';
CardFooter.displayName = 'CardFooter';

export { Card, CardContent, CardFooter, CardHeader };
