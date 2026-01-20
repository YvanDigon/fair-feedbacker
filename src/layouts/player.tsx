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
			'grid min-h-dvh grid-rows-[auto_1fr_auto] bg-gradient-to-b from-white to-green-50',
			className
		)}
		style={style}
	>
		{children}
	</div>
);

const PlayerHeader: React.FC<LayoutProps> = ({ children, className, style }) => (
	<header
		className={cn(
			'sticky top-0 z-10 bg-slate-50/95 shadow-xs backdrop-blur-xs',
			className
		)}
		style={style}
	>
		<div className="container mx-auto flex items-center justify-between p-4">
			<Logo />
			{children}
		</div>
	</header>
);

const PlayerMain: React.FC<LayoutProps> = ({ children, className, style }) => (
	<main
		className={cn('container mx-auto flex items-center px-4 py-16', className)}
		style={style}
	>
		{children}
	</main>
);

const PlayerFooter: React.FC<LayoutProps> = ({ children, className, style }) => (
	<footer
		className={cn(
			'sticky bottom-0 z-10 border-t border-slate-200 bg-slate-50/95 backdrop-blur-xs',
			className
		)}
		style={style}
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
