import { config } from '@/config';
import { globalStore } from '@/state/stores/global-store';
import { useSnapshot } from '@kokimoki/app';
import * as React from 'react';
import { useSettingsContext } from './settings-context';

export const IntroMessageEditor: React.FC = () => {
	const { introMessage } = useSnapshot(globalStore.proxy);
	const { pending, setPending } = useSettingsContext();
	const [message, setMessage] = React.useState(
		pending.introMessage !== undefined ? pending.introMessage : introMessage
	);

	React.useEffect(() => {
		if (pending.introMessage === undefined) {
			setMessage(introMessage);
		}
	}, [introMessage, pending.introMessage]);

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const value = e.target.value;
		setMessage(value);
		if (value === introMessage) {
			// Remove from pending if same as saved
			setPending((prev) => {
				const { introMessage: _, ...rest } = prev;
				return rest;
			});
		} else {
			setPending((prev) => ({ ...prev, introMessage: value }));
		}
	};

	return (
		<div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
			<h2 className="text-lg font-semibold">{config.introMessageSection}</h2>

			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-700">
					{config.introMessageLabel}
				</label>
				<textarea
					value={message}
					onChange={handleChange}
					placeholder={config.introMessagePlaceholder}
					rows={4}
					className="km-input max-w-full resize-none"
				/>
			</div>
		</div>
	);
};
