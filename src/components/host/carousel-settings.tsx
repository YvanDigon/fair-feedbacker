import { config } from '@/config';
import { globalStore } from '@/state/stores/global-store';
import { useSnapshot } from '@kokimoki/app';
import * as React from 'react';
import { useSettingsContext } from './settings-context';

export const CarouselSettings: React.FC = () => {
	const { carouselIntervalSeconds } = useSnapshot(globalStore.proxy);
	const { pending, setPending } = useSettingsContext();

	const currentInterval =
		pending.carouselIntervalSeconds !== undefined
			? pending.carouselIntervalSeconds
			: carouselIntervalSeconds;

	const [interval, setIntervalValue] = React.useState(currentInterval.toString());

	React.useEffect(() => {
		if (pending.carouselIntervalSeconds === undefined) {
			setIntervalValue(carouselIntervalSeconds.toString());
		}
	}, [carouselIntervalSeconds, pending.carouselIntervalSeconds]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setIntervalValue(value);
		const seconds = parseInt(value, 10);
		if (!isNaN(seconds) && seconds > 0) {
			if (seconds === carouselIntervalSeconds) {
				// Remove from pending if same as saved
				setPending((prev) => {
					const { carouselIntervalSeconds: _, ...rest } = prev;
					return rest;
				});
			} else {
				setPending((prev) => ({ ...prev, carouselIntervalSeconds: seconds }));
			}
		}
	};

	return (
		<div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
			<h2 className="text-lg font-semibold">{config.carouselSection}</h2>

			<div className="space-y-2">
				<label className="text-sm font-medium text-slate-700">
					{config.carouselIntervalLabel}
				</label>
				<input
					type="number"
					min="1"
					max="60"
					value={interval}
					onChange={handleChange}
					className="km-input max-w-32"
				/>
			</div>
		</div>
	);
};
