import { config } from '@/config';
import { playerActions } from '@/state/actions/player-actions';
import { globalStore } from '@/state/stores/global-store';
import { playerStore } from '@/state/stores/player-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react';
import * as React from 'react';

export const ObjectQuestionsView: React.FC = () => {
	const { objects, questions, branding } = useSnapshot(globalStore.proxy);
	const { selectedObjectId, currentAnswers } = useSnapshot(playerStore.proxy);
	const [currentQuestionIndex, setCurrentQuestionIndex] = React.useState(0);
	const [textInput, setTextInput] = React.useState('');
	const [multipleSelection, setMultipleSelection] = React.useState<number[]>([]);

	// Get object and questions
	const object = selectedObjectId ? objects[selectedObjectId] : null;
	const objectQuestions = React.useMemo(() => {
		if (!selectedObjectId) return [];
		return Object.values(questions)
			.filter((q) => q.objectId === selectedObjectId)
			.sort((a, b) => a.createdAt - b.createdAt);
	}, [selectedObjectId, questions]);

	// Computed values (with safe defaults when no questions)
	const currentQuestion = objectQuestions[currentQuestionIndex] || null;
	const isLastQuestion = currentQuestionIndex === objectQuestions.length - 1;
	const isFirstQuestion = currentQuestionIndex === 0;
	const currentAnswer = currentQuestion ? currentAnswers[currentQuestion.id] : null;

	// Get display options (randomize if needed) - HOOK BEFORE ANY RETURNS
	const displayOptions = React.useMemo(() => {
		if (!currentQuestion || (currentQuestion.type !== 'single' && currentQuestion.type !== 'multiple')) {
			return [];
		}
		
		const options = currentQuestion.options.map((text, index) => ({ text, originalIndex: index }));
		
		if (currentQuestion.randomizeOptions) {
			// Use question ID as seed for consistent randomization
			const seed = parseInt(currentQuestion.id.substring(0, 8), 16);
			return [...options].sort(() => {
				const random = Math.sin(seed) * 10000;
				return random - Math.floor(random);
			});
		}
		
		return options;
	}, [currentQuestion]);

	// Reset inputs helper
	const resetInputs = React.useCallback(() => {
		setTextInput('');
		setMultipleSelection([]);
	}, []);

	// Load answer when question changes - HOOK BEFORE ANY RETURNS
	React.useEffect(() => {
		if (!currentQuestion) return;
		const answer = currentAnswers[currentQuestion.id];
		if (answer) {
			if (answer.type === 'multiple') {
				setMultipleSelection(answer.value);
			} else if (answer.type === 'open-ended') {
				setTextInput(answer.value);
			}
		} else {
			resetInputs();
		}
	}, [currentQuestionIndex, currentQuestion, currentAnswers, resetInputs]);

	// Early return check AFTER all hooks
	if (!selectedObjectId || !object || objectQuestions.length === 0 || !currentQuestion) {
		return (
			<div className="text-center">
				<p className="theme-text-muted">{config.noQuestionsAvailable}</p>
			</div>
		);
	}

	// Handle single answer selection
	const handleSelectSingle = async (optionIndex: number) => {
		await playerActions.setSingleAnswer(currentQuestion.id, optionIndex);
	};

	// Handle multiple answer toggle
	const handleToggleMultiple = (optionIndex: number) => {
		setMultipleSelection(prev => 
			prev.includes(optionIndex) 
				? prev.filter(i => i !== optionIndex)
				: [...prev, optionIndex]
		);
	};

	// Handle rating change
	const handleRatingChange = async (value: number) => {
		await playerActions.setRatingAnswer(currentQuestion.id, value);
	};

	const handleSkip = async () => {
		if (currentQuestion.type === 'single') {
			await playerActions.setSingleAnswer(currentQuestion.id, null);
		} else if (currentQuestion.type === 'multiple') {
			await playerActions.setMultipleAnswers(currentQuestion.id, []);
		} else if (currentQuestion.type === 'open-ended') {
			await playerActions.setOpenEndedAnswer(currentQuestion.id, '');
		} else if (currentQuestion.type === 'rating') {
			await playerActions.setRatingAnswer(currentQuestion.id, null);
		}
		
		if (!isLastQuestion) {
			setCurrentQuestionIndex((prev) => prev + 1);
			resetInputs();
		}
	};

	const handleNext = async () => {
		// Save current answer before moving
		if (currentQuestion.type === 'multiple') {
			await playerActions.setMultipleAnswers(currentQuestion.id, multipleSelection);
		} else if (currentQuestion.type === 'open-ended') {
			await playerActions.setOpenEndedAnswer(currentQuestion.id, textInput);
		}
		
		if (!isLastQuestion) {
			setCurrentQuestionIndex((prev) => prev + 1);
			resetInputs();
		}
	};

	const handlePrevious = async () => {
		// Save current answer before moving
		if (currentQuestion.type === 'multiple') {
			await playerActions.setMultipleAnswers(currentQuestion.id, multipleSelection);
		} else if (currentQuestion.type === 'open-ended') {
			await playerActions.setOpenEndedAnswer(currentQuestion.id, textInput);
		}
		
		if (!isFirstQuestion) {
			setCurrentQuestionIndex((prev) => prev - 1);
			resetInputs();
		}
	};

	const handleFinish = async () => {
		// Save current answer before finishing
		if (currentQuestion.type === 'multiple') {
			await playerActions.setMultipleAnswers(currentQuestion.id, multipleSelection);
		} else if (currentQuestion.type === 'open-ended') {
			await playerActions.setOpenEndedAnswer(currentQuestion.id, textInput);
		}
		
		await playerActions.finishObject();
	};

	const handleCancel = async () => {
		await playerActions.cancelObject();
	};

	const canProceed = () => {
		if (currentQuestion.type === 'single') {
			return currentAnswer && currentAnswer.type === 'single' && currentAnswer.value !== null;
		} else if (currentQuestion.type === 'multiple') {
			return multipleSelection.length > 0;
		} else if (currentQuestion.type === 'open-ended') {
			return textInput.trim().length > 0;
		} else if (currentQuestion.type === 'rating') {
			return currentAnswer && currentAnswer.type === 'rating' && currentAnswer.value !== null;
		}
		return false;
	};

	return (
		<div className="flex w-full flex-col items-center">
			{/* Header with object name */}
			<div className="mb-4 w-full text-center">
				<h2
					className="text-lg font-semibold"
					style={{ color: branding.primaryColor }}
				>
					{object.name}
				</h2>
				<p className="text-sm theme-text-muted">
					{currentQuestionIndex + 1} {config.questionOf} {objectQuestions.length}
				</p>
			</div>

			{/* Question image */}
			{currentQuestion.imageUrl && (
				<div className="mb-6 w-full max-w-sm overflow-hidden rounded-xl">
					<img
						src={currentQuestion.imageUrl}
						alt=""
						className="aspect-video w-full object-cover"
					/>
				</div>
			)}

			{/* Question text */}
			<p className="mb-6 text-center text-lg font-medium">
				{currentQuestion.text}
			</p>

			{/* Question type-specific rendering */}
			<div className="mb-6 w-full max-w-sm">
				{/* Single Answer */}
				{currentQuestion.type === 'single' && (
					<div className="space-y-2">
						{displayOptions.map(({ text, originalIndex }) => {
							const isSelected = currentAnswer?.type === 'single' && currentAnswer.value === originalIndex;
							return (
								<button
									key={originalIndex}
									type="button"
									onClick={() => handleSelectSingle(originalIndex)}
									className={cn(
										'w-full rounded-xl border-2 p-4 text-left transition-all',
										isSelected
											? 'border-transparent text-white'
											: 'theme-card-interactive theme-border'
									)}
									style={{
										backgroundColor: isSelected ? branding.primaryColor : undefined,
										borderColor: isSelected ? branding.primaryColor : undefined
									}}
								>
									<div className="flex items-center gap-3">
										<div
											className={cn(
												'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
												isSelected ? 'border-white bg-white' : 'theme-border'
											)}
										>
											{isSelected && (
												<Check className="size-4" style={{ color: branding.primaryColor }} />
											)}
										</div>
										<span>{text}</span>
									</div>
								</button>
							);
						})}
					</div>
				)}

				{/* Multiple Answers */}
				{currentQuestion.type === 'multiple' && (
					<div className="space-y-2">
						{displayOptions.map(({ text, originalIndex }) => {
							const isSelected = multipleSelection.includes(originalIndex);
							return (
								<button
									key={originalIndex}
									type="button"
									onClick={() => handleToggleMultiple(originalIndex)}
									className={cn(
										'w-full rounded-xl border-2 p-4 text-left transition-all',
										isSelected
											? 'border-transparent text-white'
											: 'theme-card-interactive theme-border'
									)}
									style={{
										backgroundColor: isSelected ? branding.primaryColor : undefined,
										borderColor: isSelected ? branding.primaryColor : undefined
									}}
								>
									<div className="flex items-center gap-3">
										<div
											className={cn(
												'flex size-6 shrink-0 items-center justify-center rounded border-2',
												isSelected ? 'border-white bg-white' : 'theme-border'
											)}
										>
											{isSelected && (
												<Check className="size-4" style={{ color: branding.primaryColor }} />
											)}
										</div>
										<span>{text}</span>
									</div>
								</button>
							);
						})}
					</div>
				)}

				{/* Open Ended */}
				{currentQuestion.type === 'open-ended' && (
					<div>
						{currentQuestion.openEndedLength === 'short' ? (
							<input
								type="text"
								value={textInput}
								onChange={(e) => setTextInput(e.target.value)}
								placeholder="Type your answer..."
								className="km-input-themed w-full"
								maxLength={100}
							/>
						) : (
							<textarea
								value={textInput}
								onChange={(e) => setTextInput(e.target.value)}
								placeholder="Type your answer..."
								className="km-input-themed max-w-full w-full resize-none"
								rows={6}
								maxLength={500}
							/>
						)}
					</div>
				)}

				{/* Rating Scale */}
				{currentQuestion.type === 'rating' && (
					<div className="space-y-4">
						<input
							type="range"
							min="1"
							max={currentQuestion.ratingScale || 5}
							value={currentAnswer?.type === 'rating' && currentAnswer.value !== null ? currentAnswer.value : Math.ceil((currentQuestion.ratingScale || 5) / 2)}
							onChange={(e) => handleRatingChange(Number(e.target.value))}
							className="w-full"
							style={{
								accentColor: branding.primaryColor
							}}
						/>
						<div className="flex justify-between text-sm theme-text-muted">
							<span>1</span>
							<span className="text-2xl font-bold" style={{ color: branding.primaryColor }}>
								{currentAnswer?.type === 'rating' && currentAnswer.value !== null 
									? currentAnswer.value 
									: Math.ceil((currentQuestion.ratingScale || 5) / 2)}
							</span>
							<span>{currentQuestion.ratingScale || 5}</span>
						</div>
					</div>
				)}
			</div>

			{/* Navigation */}
			<div className="flex w-full max-w-sm flex-wrap items-center justify-between gap-2">
				<div className="flex gap-2">
					<button
						type="button"
						onClick={handleCancel}
						className="rounded-lg p-2 theme-text-muted theme-bg-surface-hover"
						title={config.cancelReviewButton}
					>
						<X className="size-5" />
					</button>
					{!isFirstQuestion && (
						<button
							type="button"
							onClick={handlePrevious}
							className="km-btn-secondary"
						>
							<ArrowLeft className="size-4" />
							{config.previousButton}
						</button>
					)}
				</div>

				<div className="flex gap-2">
					<button
						type="button"
						onClick={handleSkip}
						className="km-btn-neutral"
					>
						{config.skipButton}
					</button>

					{isLastQuestion ? (
						<button
							type="button"
							onClick={handleFinish}
							className="km-btn-primary"
							style={{ backgroundColor: branding.primaryColor }}
						>
							{config.finishButton}
						</button>
					) : (
						<button
							type="button"
							onClick={handleNext}
							className="km-btn-primary"
							disabled={!canProceed()}
							style={{ backgroundColor: branding.primaryColor }}
						>
							{config.nextButton}
							<ArrowRight className="size-4" />
						</button>
					)}
				</div>
			</div>

			{/* Progress dots */}
			<div className="mt-6 flex gap-1">
				{objectQuestions.map((_, index) => {
					const qId = objectQuestions[index].id;
					const hasAnswer = qId in currentAnswers;
					const isCurrent = index === currentQuestionIndex;

					return (
						<button
							key={index}
							type="button"
							onClick={() => setCurrentQuestionIndex(index)}
							className={cn(
								'size-2 rounded-full transition-all',
								isCurrent && 'scale-125'
							)}
							style={{
								backgroundColor: isCurrent 
									? branding.primaryColor 
									: hasAnswer 
										? 'var(--theme-text-muted)' 
										: 'var(--theme-border)'
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};
