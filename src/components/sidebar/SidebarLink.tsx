'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';

type SidebarLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  scroll?: boolean;
};

/**
 * Sidebar navigation link that avoids Next.js prefetch and drives navigation manually.
 * Uses router.push on primary clicks to keep SPA behavior without triggering Link prefetch.
 */
const SidebarLink = React.forwardRef<HTMLAnchorElement, SidebarLinkProps>(
  ({ href, children, className, scroll = true }, ref) => {
    const router = useRouter();
    const [, startTransition] = React.useTransition();

    const handlePointerEnter = React.useCallback(() => {
      // Intentional prefetch on hover only (no viewport prefetch)
      void router.prefetch(href);
    }, [href, router]);

    const handleClick = React.useCallback(
      (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (event.defaultPrevented) return;
        // let browser handle new tab/window or non-primary clicks
        if (
          event.metaKey ||
          event.altKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.button !== 0
        ) {
          return;
        }

        event.preventDefault();
        startTransition(() => {
          void router.push(href, { scroll });
        });
      },
      [href, router, scroll],
    );

    return (
      <a
        href={href}
        onClick={handleClick}
        onPointerEnter={handlePointerEnter}
        className={className}
        ref={ref}
      >
        {children}
      </a>
    );
  },
);

SidebarLink.displayName = 'SidebarLink';

export { SidebarLink };
