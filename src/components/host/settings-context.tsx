import * as React from 'react';

interface PrizePagePending {
	title?: string;
	imageUrl?: string | null;
	message?: string;
}

interface PendingSettings {
	logoUrl?: string | null;
	primaryColor?: string;
	introMessage?: string;
	carouselIntervalSeconds?: number;
	// Prize settings
	prizeEnabled?: boolean;
	prizeEmailCollection?: PrizePagePending;
	prizeClaim?: PrizePagePending;
}

interface SettingsContextValue {
	pending: PendingSettings;
	setPending: React.Dispatch<React.SetStateAction<PendingSettings>>;
	hasPendingChanges: boolean;
	clearPending: () => void;
}

const SettingsContext = React.createContext<SettingsContextValue | null>(null);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({
	children
}) => {
	const [pending, setPending] = React.useState<PendingSettings>({});

	const hasPendingChanges = Object.keys(pending).length > 0;

	const clearPending = () => setPending({});

	return (
		<SettingsContext.Provider
			value={{ pending, setPending, hasPendingChanges, clearPending }}
		>
			{children}
		</SettingsContext.Provider>
	);
};

export const useSettingsContext = () => {
	const context = React.useContext(SettingsContext);
	if (!context) {
		throw new Error('useSettingsContext must be used within SettingsProvider');
	}
	return context;
};
