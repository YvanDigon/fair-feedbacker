import { globalStore } from '@/state/stores/global-store';
import { useSnapshot } from '@kokimoki/app';
import * as React from 'react';

/**
 * Determine if a color is "dark" (luminance < 0.5)
 * Uses relative luminance calculation
 */
function isDarkColor(hex: string): boolean {
	// Remove # if present
	const color = hex.replace('#', '');
	
	// Parse RGB values
	const r = parseInt(color.substring(0, 2), 16) / 255;
	const g = parseInt(color.substring(2, 4), 16) / 255;
	const b = parseInt(color.substring(4, 6), 16) / 255;
	
	// Apply sRGB gamma correction
	const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
	const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
	const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
	
	// Calculate relative luminance
	const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
	
	return luminance < 0.4; // Threshold for dark backgrounds
}

/**
 * Generate derived surface colors based on background color
 */
function getDerivedColors(backgroundColor: string, isDark: boolean): Record<string, string> {
	if (isDark) {
		// Dark mode - lighter surfaces on dark background
		return {
			'--theme-surface': lightenColor(backgroundColor, 0.08),
			'--theme-surface-hover': lightenColor(backgroundColor, 0.15),
			'--theme-surface-secondary': lightenColor(backgroundColor, 0.12),
			'--theme-surface-tertiary': lightenColor(backgroundColor, 0.20),
			'--theme-border': lightenColor(backgroundColor, 0.25),
			'--theme-border-light': lightenColor(backgroundColor, 0.15),
		};
	} else {
		// Light mode - standard light surfaces
		return {
			'--theme-surface': '#ffffff',
			'--theme-surface-hover': '#f8fafc',
			'--theme-surface-secondary': '#f1f5f9',
			'--theme-surface-tertiary': '#e2e8f0',
			'--theme-border': '#cbd5e1',
			'--theme-border-light': '#e2e8f0',
		};
	}
}

/**
 * Generate derived text colors based on main text color
 */
function getDerivedTextColors(textColor: string, isDark: boolean): Record<string, string> {
	if (isDark) {
		// Dark mode - muted light text
		return {
			'--theme-text-muted': darkenColor(textColor, 0.35),
			'--theme-text-secondary': darkenColor(textColor, 0.20),
		};
	} else {
		// Light mode - muted dark text
		return {
			'--theme-text-muted': '#64748b',
			'--theme-text-secondary': '#475569',
		};
	}
}

/**
 * Lighten a hex color by a given amount (0-1)
 */
function lightenColor(hex: string, amount: number): string {
	const color = hex.replace('#', '');
	const r = parseInt(color.substring(0, 2), 16);
	const g = parseInt(color.substring(2, 4), 16);
	const b = parseInt(color.substring(4, 6), 16);
	
	const newR = Math.min(255, Math.round(r + (255 - r) * amount));
	const newG = Math.min(255, Math.round(g + (255 - g) * amount));
	const newB = Math.min(255, Math.round(b + (255 - b) * amount));
	
	return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * Darken a hex color by a given amount (0-1)
 */
function darkenColor(hex: string, amount: number): string {
	const color = hex.replace('#', '');
	const r = parseInt(color.substring(0, 2), 16);
	const g = parseInt(color.substring(2, 4), 16);
	const b = parseInt(color.substring(4, 6), 16);
	
	const newR = Math.max(0, Math.round(r * (1 - amount)));
	const newG = Math.max(0, Math.round(g * (1 - amount)));
	const newB = Math.max(0, Math.round(b * (1 - amount)));
	
	return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

/**
 * ThemeProvider component that applies theme colors as CSS variables
 */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
	children
}) => {
	const { branding } = useSnapshot(globalStore.proxy);

	React.useEffect(() => {
		const root = document.documentElement;
		const isDark = isDarkColor(branding.backgroundColor);
		
		// Toggle dark theme class for CSS overrides
		if (isDark) {
			root.classList.add('dark-theme');
		} else {
			root.classList.remove('dark-theme');
		}
		
		// Apply core theme colors
		root.style.setProperty('--theme-primary', branding.primaryColor);
		root.style.setProperty('--theme-secondary', branding.secondaryColor);
		root.style.setProperty('--theme-accent', branding.accentColor);
		root.style.setProperty('--theme-background', branding.backgroundColor);
		root.style.setProperty('--theme-gradient', branding.gradientColor);
		root.style.setProperty('--theme-text', branding.textColor);
		
		// Apply derived surface colors
		const surfaceColors = getDerivedColors(branding.backgroundColor, isDark);
		Object.entries(surfaceColors).forEach(([key, value]) => {
			root.style.setProperty(key, value);
		});
		
		// Apply derived text colors
		const textColors = getDerivedTextColors(branding.textColor, isDark);
		Object.entries(textColors).forEach(([key, value]) => {
			root.style.setProperty(key, value);
		});
	}, [
		branding.primaryColor,
		branding.secondaryColor,
		branding.accentColor,
		branding.backgroundColor,
		branding.gradientColor,
		branding.textColor
	]);

	return <>{children}</>;
};
