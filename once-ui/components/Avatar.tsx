'use client';

import { cn } from '@/app/utils/cn';
import React, { forwardRef } from 'react';
import { Flex, Icon, Skeleton, SmartImage, StatusIndicator, Text } from '.';
import styles from './Avatar.module.scss';

interface AvatarProps {
  size?: 'xs' | 's' | 'm' | 'l' | 'xl';
  value?: string;
  src?: string;
  gifSrc?: string; // New prop for the GIF version
  loading?: boolean;
  empty?: boolean;
  statusIndicator?: {
    color: 'green' | 'yellow' | 'red' | 'gray';
  };
  style?: React.CSSProperties;
  className?: string;
  animated?: boolean; // New prop to toggle animation feature
}

const sizeMapping: Record<'xs' | 's' | 'm' | 'l' | 'xl', number> = {
  xs: 20,
  s: 24,
  m: 32,
  l: 48,
  xl: 160,
};

const statusIndicatorSizeMapping: Record<
  'xs' | 's' | 'm' | 'l' | 'xl',
  's' | 'm' | 'l'
> = {
  xs: 's',
  s: 's',
  m: 'm',
  l: 'm',
  xl: 'l',
};

const Avatar: React.FC<AvatarProps> = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      size = 'm',
      value,
      src,
      gifSrc,
      loading,
      empty,
      statusIndicator,
      style,
      className,
      animated = false,
    },
    ref,
  ) => {
    const isEmpty = empty || (!src && !value);

    if (value && src) {
      throw new Error("Avatar cannot have both 'value' and 'src' props.");
    }

    if (loading) {
      return (
        <Skeleton
          style={{ border: '1px solid var(--neutral-border-medium)' }}
          shape="circle"
          width={size}
          height={size}
          className={`${styles.avatar} ${className}`}
          aria-busy="true"
          aria-label="Loading avatar"
        />
      );
    }

    const renderContent = () => {
      if (isEmpty) {
        return (
          <Icon
            onBackground="neutral-medium"
            name="person"
            size={size as 'xs' | 's' | 'm' | 'l' | 'xl'}
            className={styles.icon}
            aria-label="Empty avatar"
          />
        );
      }

      if (src) {
        if (animated && gifSrc) {
          return (
            <div
              className={cn(
                'w-full h-full relative rounded-full overflow-hidden',
                'transition-all duration-500',
                `bg-[url('${src}')] bg-cover bg-center`,
                `before:bg-[url('${gifSrc}')] before:absolute before:top-0 before:left-0 before:w-full before:h-full before:opacity-0 before:z-[-1]`,
                `hover:bg-[url('${gifSrc}')]`,
                'group',
              )}
            >
              <div className="absolute inset-0 bg-black opacity-0 transition-opacity duration-500 group-hover:opacity-50" />
            </div>
          );
        }

        return (
          <SmartImage
            radius="full"
            src={src}
            fill
            alt="Avatar"
            sizes={`${sizeMapping[size]}px`}
            className={styles.image}
          />
        );
      }

      if (value) {
        return (
          <Text
            as="span"
            onBackground="neutral-weak"
            variant={`body-default-${size}`}
            className={styles.value}
            aria-label={`Avatar with initials ${value}`}
          >
            {value}
          </Text>
        );
      }

      return null;
    };

    return (
      <Flex
        ref={ref}
        role="img"
        position="relative"
        justifyContent="center"
        alignItems="center"
        radius="full"
        border="neutral-strong"
        borderStyle="solid-1"
        background="surface"
        style={style}
        className={cn(
          styles.avatar,
          styles[size],
          animated && gifSrc && 'cursor-pointer',
          className,
        )}
      >
        {renderContent()}
        {statusIndicator && (
          <StatusIndicator
            size={statusIndicatorSizeMapping[size]}
            color={statusIndicator.color}
            className={`${styles.className || ''} ${styles.indicator} ${size === 'xl' ? styles.position : ''}`}
            aria-label={`Status: ${statusIndicator.color}`}
          />
        )}
      </Flex>
    );
  },
);

Avatar.displayName = 'Avatar';

export { Avatar };
export type { AvatarProps };
