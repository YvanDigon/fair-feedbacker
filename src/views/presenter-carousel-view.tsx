import { config } from '@/config';
import { globalStore } from '@/state/stores/global-store';
import type { Question } from '@/types/feedbacker';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import * as React from 'react';

interface CarouselQuestion extends Question {
	objectName: string;
}

export const PresenterCarouselView: React.FC = () => {
	const { objects, questions, responses, branding, carouselIntervalSeconds } =
		useSnapshot(globalStore.proxy);
	const [currentIndex, setCurrentIndex] = React.useState(0);
	const [isTransitioning, setIsTransitioning] = React.useState(false);

	// Build a flat list of all questions with their object names
	const allQuestions: CarouselQuestion[] = React.useMemo(() => {
		const sortedObjects = Object.values(objects).sort(
			(a, b) => a.createdAt - b.createdAt
		);

		const result: CarouselQuestion[] = [];
		for (const obj of sortedObjects) {
			const objQuestions = Object.values(questions)
				.filter((q) => q.objectId === obj.id)
				.sort((a, b) => a.createdAt - b.createdAt);

			for (const q of objQuestions) {
				result.push({
					...q,
					objectName: obj.name
				});
			}
		}
		return result;
	}, [objects, questions]);

	// Auto-advance carousel
	React.useEffect(() => {
		if (allQuestions.length <= 1) return;

		const interval = setInterval(() => {
			setIsTransitioning(true);
			setTimeout(() => {
				setCurrentIndex((prev) => (prev + 1) % allQuestions.length);
				setIsTransitioning(false);
			}, 300);
		}, carouselIntervalSeconds * 1000);

		return () => clearInterval(interval);
	}, [allQuestions.length, carouselIntervalSeconds]);

	// Reset index if questions change
	React.useEffect(() => {
		if (currentIndex >= allQuestions.length) {
			setCurrentIndex(0);
		}
	}, [allQuestions.length, currentIndex]);

	if (allQuestions.length === 0) {
		return (
			<div className="flex h-full items-center justify-center">
				<p className="text-2xl text-slate-400">{config.noQuestionsYet}</p>
			</div>
		);
	}

	const currentQuestion = allQuestions[currentIndex];

	// Get responses for current question
	const questionResponses = Object.values(responses).filter(
		(r) => r.questionId === currentQuestion.id
	);
	const totalResponses = questionResponses.length;
	const skipCount = questionResponses.filter(
		(r) => r.selectedOptionIndex === null
	).length;
	const answeredCount = totalResponses - skipCount;

	// Calculate distribution
	const distribution = currentQuestion.options.map((_, index) => {
		const count = questionResponses.filter(
			(r) => r.selectedOptionIndex === index
		).length;
		return {
			count,
			percentage: answeredCount > 0 ? (count / answeredCount) * 100 : 0
		};
	});

	return (
		<div className="flex h-full w-full flex-col items-center justify-center gap-8 p-8">
			{/* Question slide */}
			<div
				className={cn(
					'flex w-full max-w-4xl flex-col items-center gap-6 transition-opacity duration-300',
					isTransitioning ? 'opacity-0' : 'opacity-100'
				)}
			>
				{/* Object name */}
				<div
					className="rounded-full px-6 py-2 text-lg font-semibold text-white"
					style={{ backgroundColor: branding.primaryColor }}
				>
					{currentQuestion.objectName}
				</div>

				{/* Question content */}
				<div className="flex w-full gap-8">
					{/* Image */}
					{currentQuestion.imageUrl && (
						<div className="w-1/2 overflow-hidden rounded-2xl">
							<img
								src={currentQuestion.imageUrl}
								alt=""
								className="aspect-video w-full object-cover"
							/>
						</div>
					)}

					{/* Chart and text */}
					<div
						className={cn(
							'flex flex-col items-center justify-center gap-6',
							currentQuestion.imageUrl ? 'w-1/2' : 'w-full'
						)}
					>
						{/* Question text */}
						<h2 className="text-center text-3xl font-bold text-slate-900">
							{currentQuestion.text}
						</h2>

						{/* Donut chart */}
						<DonutChart
							data={distribution}
							options={currentQuestion.options}
							primaryColor={branding.primaryColor}
							totalResponses={totalResponses}
						/>

						{/* Response count */}
						<p className="text-lg text-slate-500">
							{totalResponses} {config.responsesLabel}
							{skipCount > 0 && (
								<span className="ml-2 text-amber-600">
									({skipCount} {config.skipCount.toLowerCase()})
								</span>
							)}
						</p>
					</div>
				</div>
			</div>

			{/* Progress indicators */}
			<div className="flex gap-2">
				{allQuestions.map((_, index) => (
					<div
						key={index}
						className={cn(
							'h-2 rounded-full transition-all',
							index === currentIndex ? 'w-8' : 'w-2'
						)}
						style={{
							backgroundColor:
								index === currentIndex ? branding.primaryColor : '#cbd5e1'
						}}
					/>
				))}
			</div>
		</div>
	);
};

interface DonutChartProps {
	data: Array<{ count: number; percentage: number }>;
	options: string[];
	primaryColor: string;
	totalResponses: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
	data,
	options,
	primaryColor,
	totalResponses
}) => {
	const size = 200;
	const strokeWidth = 30;
	const radius = (size - strokeWidth) / 2;
	const circumference = 2 * Math.PI * radius;

	// Generate colors based on primary color
	const colors = React.useMemo(() => {
		const baseHue = hexToHsl(primaryColor).h;
		return options.map((_, i) => {
			const hue = (baseHue + i * (360 / Math.max(options.length, 1))) % 360;
			return `hsl(${hue}, 70%, 55%)`;
		});
	}, [primaryColor, options]);

	// Calculate stroke dash offsets using reduce to avoid mutation
	const segments = React.useMemo(() => {
		const result: Array<{
			dashLength: number;
			dashOffset: number;
			color: string;
			percentage: number;
			count: number;
		}> = [];
		
		const cumulativePercentages = data.reduce<number[]>((acc, item) => {
			const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
			acc.push(prev + item.percentage);
			return acc;
		}, []);
		
		data.forEach((item, index) => {
			const cumulative = index === 0 ? 0 : cumulativePercentages[index - 1];
			const dashLength = (item.percentage / 100) * circumference;
			const dashOffset = circumference - (cumulative / 100) * circumference;
			result.push({
				dashLength,
				dashOffset,
				color: colors[index],
				percentage: item.percentage,
				count: item.count
			});
		});
		
		return result;
	}, [data, circumference, colors]);

	if (totalResponses === 0) {
		return (
			<div className="flex size-[200px] items-center justify-center rounded-full border-8 border-slate-200">
				<span className="text-lg text-slate-400">{config.noResponses}</span>
			</div>
		);
	}

	return (
		<div className="relative">
			<svg width={size} height={size} className="-rotate-90">
				{/* Background circle */}
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill="none"
					stroke="#e2e8f0"
					strokeWidth={strokeWidth}
				/>
				{/* Data segments */}
				{segments.map((segment, index) => (
					<circle
						key={index}
						cx={size / 2}
						cy={size / 2}
						r={radius}
						fill="none"
						stroke={segment.color}
						strokeWidth={strokeWidth}
						strokeDasharray={`${segment.dashLength} ${circumference - segment.dashLength}`}
						strokeDashoffset={segment.dashOffset}
						className="transition-all duration-500"
					/>
				))}
			</svg>

			{/* Legend */}
			<div className="absolute -right-52 top-0 space-y-2">
				{options.map((option, index) => (
					<div key={index} className="flex items-center gap-2">
						<div
							className="size-4 shrink-0 rounded"
							style={{ backgroundColor: colors[index] }}
						/>
						<span className="text-sm font-medium">
							{option} ({data[index].count})
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

// Helper to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return { h: 220, s: 70, l: 55 };

	const r = parseInt(result[1], 16) / 255;
	const g = parseInt(result[2], 16) / 255;
	const b = parseInt(result[3], 16) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch (max) {
			case r:
				h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
				break;
			case g:
				h = ((b - r) / d + 2) / 6;
				break;
			case b:
				h = ((r - g) / d + 4) / 6;
				break;
		}
	}

	return { h: h * 360, s: s * 100, l: l * 100 };
}
