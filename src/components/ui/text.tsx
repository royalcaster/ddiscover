import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { Text as NativeText, type TextProps } from 'react-native';

import { cn } from '@/lib/utils';

const textVariants = cva('text-foreground', {
  variants: {
    variant: {
      body: 'text-base leading-6',
      label: 'text-sm font-medium leading-5',
      caption: 'text-xs font-medium uppercase tracking-[0.08em] text-mutedForeground',
      muted: 'text-sm leading-5 text-mutedForeground',
      title: 'text-[32px] font-semibold leading-[38px]',
      hero: 'text-[40px] font-semibold leading-[46px]',
      section: 'text-xl font-semibold leading-7',
      mono: 'font-mono text-[11px] font-semibold uppercase tracking-[0.14em]',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

type AppTextProps = TextProps &
  VariantProps<typeof textVariants> & {
    className?: string;
  };

const Text = React.forwardRef<NativeText, AppTextProps>(
  ({ className, variant, ...props }, ref) => (
    <NativeText ref={ref} className={cn(textVariants({ variant }), className)} {...props} />
  ),
);

Text.displayName = 'Text';

export { Text, textVariants };
