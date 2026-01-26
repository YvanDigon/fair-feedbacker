import { config } from '@/config';
import { globalStore } from '@/state/stores/global-store';
import type { Question } from '@/types/feedbacker';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import * as React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import WordCloud from 'wordcloud';

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
				<p className="text-2xl theme-text-muted">{config.noQuestionsYet}</p>
			</div>
		);
	}

	const currentQuestion = allQuestions[currentIndex];

	// Get responses for current question
	const questionResponses = Object.values(responses).filter(
		(r) => r.questionId === currentQuestion.id
	);
	const totalResponses = questionResponses.length;

	// Calculate stats based on question type
	let skipCount = 0;
	let answeredCount = 0;

	if (currentQuestion.type === 'single') {
		skipCount = questionResponses.filter(
			(r) => r.selectedOptionIndex === null
		).length;
		answeredCount = totalResponses - skipCount;
	} else if (currentQuestion.type === 'multiple') {
		skipCount = questionResponses.filter(
			(r) => !r.selectedOptionIndexes || r.selectedOptionIndexes.length === 0
		).length;
		answeredCount = totalResponses - skipCount;
	} else if (currentQuestion.type === 'open-ended') {
		skipCount = questionResponses.filter(
			(r) => !r.textAnswer || r.textAnswer.trim() === ''
		).length;
		answeredCount = totalResponses - skipCount;
	} else if (currentQuestion.type === 'rating') {
		skipCount = questionResponses.filter(
			(r) => r.ratingValue === null || r.ratingValue === undefined
		).length;
		answeredCount = totalResponses - skipCount;
	}

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
						<h2 className="text-center text-3xl font-bold theme-text">
							{currentQuestion.text}
						</h2>

						{/* Visualization based on question type */}
						{currentQuestion.type === 'single' && (
							<DonutChart
								responses={questionResponses}
								options={currentQuestion.options}
								primaryColor={branding.primaryColor}
								totalResponses={totalResponses}
								answeredCount={answeredCount}
							/>
						)}

						{currentQuestion.type === 'multiple' && (
							<MultipleBarChart
								responses={questionResponses}
								options={currentQuestion.options}
								primaryColor={branding.primaryColor}
								totalResponses={totalResponses}
								answeredCount={answeredCount}
							/>
						)}

						{currentQuestion.type === 'open-ended' && (
							<OpenEndedWordCloud
								responses={questionResponses}
								primaryColor={branding.primaryColor}
								totalResponses={totalResponses}
							/>
						)}

						{currentQuestion.type === 'rating' && (
							<RatingLikert
								responses={questionResponses}
								scale={currentQuestion.ratingScale || 5}
								primaryColor={branding.primaryColor}
								totalResponses={totalResponses}
								answeredCount={answeredCount}
							/>
						)}

						{/* Response count */}
						<p className="text-lg theme-text-muted">
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
								index === currentIndex ? branding.primaryColor : 'var(--theme-border)'
						}}
					/>
				))}
			</div>
		</div>
	);
};

interface DonutChartProps {
	responses: Array<{ selectedOptionIndex: number | null }>;
	options: string[];
	primaryColor: string;
	totalResponses: number;
	answeredCount: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
	responses,
	options,
	primaryColor,
	totalResponses,
	answeredCount
}) => {
	// Calculate distribution
	const distribution = React.useMemo(() => {
		return options.map((_, index) => {
			const count = responses.filter(
				(r) => r.selectedOptionIndex === index
			).length;
			return {
				count,
				percentage: answeredCount > 0 ? (count / answeredCount) * 100 : 0
			};
		});
	}, [responses, options, answeredCount]);

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
		
		const cumulativePercentages = distribution.reduce<number[]>((acc, item) => {
			const prev = acc.length > 0 ? acc[acc.length - 1] : 0;
			acc.push(prev + item.percentage);
			return acc;
		}, []);
		
		distribution.forEach((item, index) => {
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
	}, [distribution, circumference, colors]);

	if (totalResponses === 0) {
		return (
			<div 
				className="flex size-[200px] items-center justify-center rounded-full border-8"
				style={{ borderColor: 'var(--theme-border-light)' }}
			>
				<span className="text-lg theme-text-muted">{config.noResponses}</span>
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
							{option} ({distribution[index].count})
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

// Multiple choice bar chart
interface MultipleBarChartProps {
	responses: Array<{ selectedOptionIndexes?: number[] }>;
	options: string[];
	primaryColor: string;
	totalResponses: number;
	answeredCount: number;
}

const MultipleBarChart: React.FC<MultipleBarChartProps> = ({
	responses,
	options,
	primaryColor,
	answeredCount
}) => {
	const data = React.useMemo(() => {
		return options.map((option, index) => {
			const count = responses.filter(
				(r) => r.selectedOptionIndexes && r.selectedOptionIndexes.includes(index)
			).length;
			const percentage = answeredCount > 0 ? (count / answeredCount) * 100 : 0;
			return {
				option,
				count,
				percentage
			};
		});
	}, [responses, options, answeredCount]);

	const baseHue = hexToHsl(primaryColor).h;

	if (answeredCount === 0) {
		return (
			<div className="flex h-48 items-center justify-center">
				<span className="text-lg theme-text-muted">{config.noResponses}</span>
			</div>
		);
	}

	return (
		<ResponsiveContainer width="100%" height={300}>
			<BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
				<CartesianGrid strokeDasharray="3 3" opacity={0.3} />
				<XAxis dataKey="option" />
				<YAxis label={{ value: 'Selections (%)', angle: -90, position: 'insideLeft' }} />
				<Tooltip 
					content={({ active, payload }) => {
						if (active && payload && payload.length) {
							return (
								<div className="rounded-lg border bg-white p-2 shadow-md">
									<p className="font-semibold">{payload[0].payload.option}</p>
									<p className="text-sm">
										{payload[0].payload.count} ({payload[0].payload.percentage.toFixed(1)}%)
									</p>
								</div>
							);
						}
						return null;
					}}
				/>
				<Bar dataKey="percentage" radius={[8, 8, 0, 0]}>
					{data.map((_, index) => {
						const hue = (baseHue + index * (360 / Math.max(options.length, 1))) % 360;
						const color = `hsl(${hue}, 70%, 55%)`;
						return <Cell key={`cell-${index}`} fill={color} />;
					})}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	);
};

// Open-ended word cloud
interface OpenEndedWordCloudProps {
	responses: Array<{ textAnswer?: string }>;
	primaryColor: string;
	totalResponses: number;
}

const OpenEndedWordCloud: React.FC<OpenEndedWordCloudProps> = ({
	responses,
	primaryColor
}) => {
	const canvasRef = React.useRef<HTMLCanvasElement>(null);

	// Extract words and frequencies
	const wordFrequencies = React.useMemo(() => {
		const wordMap = new Map<string, number>();
		
		responses.forEach((r) => {
			if (r.textAnswer && r.textAnswer.trim()) {
				// Split into words, filter common words
				const words = r.textAnswer
					.toLowerCase()
					.split(/\s+/)
					.filter((w) => w.length > 2) // Ignore very short words
					.filter((w) => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'was'].includes(w));

				words.forEach((word) => {
					wordMap.set(word, (wordMap.get(word) || 0) + 1);
				});
			}
		});

		// Convert to array and sort by frequency
		return Array.from(wordMap.entries())
			.sort((a, b) => b[1] - a[1])
			.slice(0, 50); // Top 50 words
	}, [responses]);

	React.useEffect(() => {
		if (!canvasRef.current || wordFrequencies.length === 0) return;

		const canvas = canvasRef.current;
		const baseHue = hexToHsl(primaryColor).h;

		// Prepare word list for wordcloud library
		const wordList: [string, number][] = wordFrequencies.map(([word, count]) => [word, count * 10]);

		WordCloud(canvas, {
			list: wordList,
			gridSize: 8,
			weightFactor: 2,
			fontFamily: 'Noto Sans, sans-serif',
			color: () => {
				const hue = (baseHue + Math.random() * 60 - 30) % 360; // Vary hue slightly
				const saturation = 60 + Math.random() * 20; // 60-80%
				const lightness = 45 + Math.random() * 20; // 45-65%
				return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
			},
			rotateRatio: 0.3,
			backgroundColor: 'transparent'
		});
	}, [wordFrequencies, primaryColor]);

	if (wordFrequencies.length === 0) {
		return (
			<div className="flex h-48 items-center justify-center">
				<span className="text-lg theme-text-muted">{config.noResponses}</span>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-center">
			<canvas ref={canvasRef} width={500} height={300} />
		</div>
	);
};

// Rating likert scale
interface RatingLikertProps {
	responses: Array<{ ratingValue?: number | null }>;
	scale: 5 | 7 | 10 | 11;
	primaryColor: string;
	totalResponses: number;
	answeredCount: number;
}

const RatingLikert: React.FC<RatingLikertProps> = ({
	responses,
	scale,
	primaryColor,
	answeredCount
}) => {
	const data = React.useMemo(() => {
		// Count responses for each rating value
		const counts = new Array(scale + 1).fill(0); // scale + 1 for 0-based or 1-based
		
		responses.forEach((r) => {
			if (r.ratingValue !== null && r.ratingValue !== undefined) {
				counts[r.ratingValue] = (counts[r.ratingValue] || 0) + 1;
			}
		});

		// Create data for chart (only include actual scale values)
		const result = [];
		for (let i = 0; i <= scale; i++) {
			result.push({
				rating: i,
				count: counts[i] || 0,
				percentage: answeredCount > 0 ? ((counts[i] || 0) / answeredCount) * 100 : 0
			});
		}

		return result;
	}, [responses, scale, answeredCount]);

	const avgRating = React.useMemo(() => {
		const validResponses = responses.filter(
			(r) => r.ratingValue !== null && r.ratingValue !== undefined
		);
		if (validResponses.length === 0) return 0;
		const sum = validResponses.reduce((acc, r) => acc + (r.ratingValue || 0), 0);
		return sum / validResponses.length;
	}, [responses]);

	if (answeredCount === 0) {
		return (
			<div className="flex h-48 items-center justify-center">
				<span className="text-lg theme-text-muted">{config.noResponses}</span>
			</div>
		);
	}

	return (
		<div className="w-full space-y-4">
			{/* Average rating */}
			<div className="text-center">
				<div className="text-4xl font-bold" style={{ color: primaryColor }}>
					{avgRating.toFixed(1)} / {scale}
				</div>
				<div className="text-sm theme-text-muted">{config.averageRating}</div>
			</div>

			{/* Horizontal bar chart */}
			<div className="space-y-2">
				{data.map((item) => (
					<div key={item.rating} className="flex items-center gap-3">
						<div className="w-8 text-right text-sm font-medium theme-text">
							{item.rating}
						</div>
						<div className="flex-1">
							<div className="h-6 overflow-hidden rounded-full bg-slate-200">
								<div
									className="h-full rounded-full transition-all duration-500"
									style={{
										width: `${item.percentage}%`,
										backgroundColor: primaryColor
									}}
								/>
							</div>
						</div>
						<div className="w-16 text-right text-sm theme-text-muted">
							{item.count} ({item.percentage.toFixed(0)}%)
						</div>
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
