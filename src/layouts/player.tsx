import { Logo } from '@/components/logo';
import { cn } from '@/utils/cn';
import * as React from 'react';

interface LayoutProps {
	children?: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}

const PlayerRoot: React.FC<LayoutProps> = ({ children, className, style }) => (
	<div
		className={cn(
			'grid min-h-dvh grid-rows-[auto_1fr_auto]',
			className
		)}
		style={{
			background: 'linear-gradient(to bottom, var(--theme-background), var(--theme-gradient))',
			color: 'var(--theme-text)',
			...style
		}}
	>
		{children}
	</div>
);

const PlayerHeader: React.FC<LayoutProps> = ({ children, className, style }) => (
	<header
		className={cn(
			'sticky top-0 z-10 shadow-xs backdrop-blur-xs',
			className
		)}
		style={{
			backgroundColor: 'color-mix(in srgb, var(--theme-surface) 95%, transparent)',
			...style
		}}
	>
		<div className="container mx-auto flex items-center justify-between p-4">
			<Logo />
			{children}
		</div>
	</header>
);

const PlayerMain: React.FC<LayoutProps> = ({ children, className, style }) => (
	<main
		className={cn('container mx-auto flex items-center justify-center px-4 py-16', className)}
		style={style}
	>
		{children}
	</main>
);

const PlayerFooter: React.FC<LayoutProps> = ({ children, className, style }) => (
	<footer
		className={cn(
			'sticky bottom-0 z-10 border-t backdrop-blur-xs',
			className
		)}
		style={{
			backgroundColor: 'color-mix(in srgb, var(--theme-surface) 95%, transparent)',
			borderColor: 'var(--theme-border-light)',
			...style
		}}
	>
		<div className="container mx-auto flex justify-center p-4">{children}</div>
	</footer>
);

/**
 * Layout components for the `player` mode
 */
export const PlayerLayout = {
	Root: PlayerRoot,
	Header: PlayerHeader,
	Main: PlayerMain,
	Footer: PlayerFooter
};
