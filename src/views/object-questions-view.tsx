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

	if (!selectedObjectId) return null;

	const object = objects[selectedObjectId];
	const objectQuestions = Object.values(questions)
		.filter((q) => q.objectId === selectedObjectId)
		.sort((a, b) => a.createdAt - b.createdAt);

	if (!object || objectQuestions.length === 0) {
		return (
			<div className="text-center">
				<p className="text-slate-500">No questions available</p>
			</div>
		);
	}

	const currentQuestion = objectQuestions[currentQuestionIndex];
	const isLastQuestion = currentQuestionIndex === objectQuestions.length - 1;
	const isFirstQuestion = currentQuestionIndex === 0;

	const selectedOption = currentAnswers[currentQuestion.id] ?? null;

	const handleSelectOption = async (optionIndex: number) => {
		await playerActions.setAnswer(currentQuestion.id, optionIndex);
	};

	const handleSkip = async () => {
		await playerActions.setAnswer(currentQuestion.id, null);
		if (!isLastQuestion) {
			setCurrentQuestionIndex((prev) => prev + 1);
		}
	};

	const handleNext = () => {
		if (!isLastQuestion) {
			setCurrentQuestionIndex((prev) => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (!isFirstQuestion) {
			setCurrentQuestionIndex((prev) => prev - 1);
		}
	};

	const handleFinish = async () => {
		await playerActions.finishObject();
	};

	const handleCancel = async () => {
		await playerActions.cancelObject();
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
				<p className="text-sm text-slate-500">
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

			{/* Options */}
			<div className="mb-6 w-full max-w-sm space-y-2">
				{currentQuestion.options.map((option, index) => (
					<button
						key={index}
						type="button"
						onClick={() => handleSelectOption(index)}
						className={cn(
							'w-full rounded-xl border-2 p-4 text-left transition-all',
							selectedOption === index
								? 'border-transparent text-white'
								: 'border-slate-200 bg-white hover:border-slate-300'
						)}
						style={{
							backgroundColor:
								selectedOption === index ? branding.primaryColor : undefined,
							borderColor:
								selectedOption === index ? branding.primaryColor : undefined
						}}
					>
						<div className="flex items-center gap-3">
							<div
								className={cn(
									'flex size-6 shrink-0 items-center justify-center rounded-full border-2',
									selectedOption === index
										? 'border-white bg-white'
										: 'border-slate-300'
								)}
							>
								{selectedOption === index && (
									<Check
										className="size-4"
										style={{ color: branding.primaryColor }}
									/>
								)}
							</div>
							<span>{option}</span>
						</div>
					</button>
				))}
			</div>

			{/* Navigation */}
			<div className="flex w-full max-w-sm flex-wrap items-center justify-between gap-2">
				<div className="flex gap-2">
					<button
						type="button"
						onClick={handleCancel}
						className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
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
						disabled={isLastQuestion && selectedOption === null}
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
								isCurrent
									? 'scale-125'
									: hasAnswer
										? 'bg-slate-400'
										: 'bg-slate-200'
							)}
							style={{
								backgroundColor: isCurrent ? branding.primaryColor : undefined
							}}
						/>
					);
				})}
			</div>
		</div>
	);
};
