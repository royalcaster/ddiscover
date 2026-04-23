import { cva, type VariantProps } from 'class-variance-authority';
import React from 'react';
import { Pressable, View, type PressableProps } from 'react-native';

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md border px-4 active:opacity-85',
  {
    variants: {
      variant: {
        default: 'border-primary bg-primary',
        secondary: 'border-border bg-secondary',
        outline: 'border-border bg-background',
        ghost: 'border-transparent bg-transparent',
      },
      size: {
        default: 'h-11',
        sm: 'h-9 px-3',
        icon: 'h-10 w-10 px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

const buttonTextVariants = cva('font-medium', {
  variants: {
    variant: {
      default: 'text-primaryForeground',
      secondary: 'text-foreground',
      outline: 'text-foreground',
      ghost: 'text-mutedForeground',
    },
    size: {
      default: 'text-sm',
      sm: 'text-sm',
      icon: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ButtonProps = Omit<PressableProps, 'children'> &
  VariantProps<typeof buttonVariants> & {
    children?: React.ReactNode;
    className?: string;
    labelClassName?: string;
    label?: string;
    leadingIcon?: React.ReactNode;
    trailingIcon?: React.ReactNode;
  };

const Button = React.forwardRef<React.ElementRef<typeof Pressable>, ButtonProps>(
  (
    {
      children,
      className,
      disabled,
      label,
      labelClassName,
      leadingIcon,
      size,
      trailingIcon,
      variant,
      ...props
    },
    ref,
  ) => (
    <Pressable
      ref={ref}
      className={cn(disabled && 'opacity-50', buttonVariants({ size, variant }), className)}
      disabled={disabled}
      {...props}>
      <View className="flex-row items-center justify-center gap-2">
        {leadingIcon}
        {label ? (
          <Text className={cn(buttonTextVariants({ size, variant }), labelClassName)}>{label}</Text>
        ) : null}
        {children}
        {trailingIcon}
      </View>
    </Pressable>
  ),
);

Button.displayName = 'Button';

export { Button, buttonVariants };
