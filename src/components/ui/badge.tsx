import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { View, type ViewProps } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const badgeVariants = cva('rounded-md border px-2.5 py-1', {
  variants: {
    variant: {
      default: 'border-primary/30 bg-primary',
      neutral: 'border-border bg-secondary',
      outline: 'border-border bg-transparent',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

const badgeTextVariants = cva('text-[11px] font-semibold uppercase tracking-[0.12em]', {
  variants: {
    variant: {
      default: 'text-primaryForeground',
      neutral: 'text-foreground',
      outline: 'text-mutedForeground',
    },
  },
  defaultVariants: {
    variant: 'neutral',
  },
});

type BadgeProps = ViewProps &
  VariantProps<typeof badgeVariants> & {
    className?: string;
    label: string;
  };

function Badge({ className, label, variant, ...props }: BadgeProps) {
  return (
    <View className={cn(badgeVariants({ variant }), className)} {...props}>
      <Text className={badgeTextVariants({ variant })}>{label}</Text>
    </View>
  );
}

export { Badge };
