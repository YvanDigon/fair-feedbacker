import { config } from '@/config';
import { globalActions } from '@/state/actions/global-actions';
import { globalStore } from '@/state/stores/global-store';
import { useSnapshot } from '@kokimoki/app';
import { BarChart3, RefreshCw, Trash2 } from 'lucide-react';
import * as React from 'react';

export const StatsDashboard: React.FC = () => {
	const { objects, questions, responses } = useSnapshot(globalStore.proxy);
	const [selectedObjectId, setSelectedObjectId] = React.useState<string | null>(
		null
	);

	const sortedObjects = Object.values(objects).sort(
		(a, b) => a.createdAt - b.createdAt
	);

	const getQuestionsForObject = (objectId: string) => {
		return Object.values(questions)
			.filter((q) => q.objectId === objectId)
			.sort((a, b) => a.createdAt - b.createdAt);
	};

	const getResponsesForQuestion = (questionId: string) => {
		return Object.values(responses).filter((r) => r.questionId === questionId);
	};

	const getTotalResponses = () => {
		return Object.keys(responses).length;
	};

	const handleReset = async () => {
		if (confirm(config.resetConfirmMessage)) {
			await globalActions.resetResponses();
		}
	};

	const displayObjects = selectedObjectId
		? sortedObjects.filter((o) => o.id === selectedObjectId)
		: sortedObjects;

	return (
		<div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
			<div className="flex items-center justify-between">
				<h2 className="flex items-center gap-2 text-lg font-semibold">
					<BarChart3 className="size-5" />
					{config.statsSection}
				</h2>
				<button
					type="button"
					onClick={handleReset}
					className="km-btn-error text-sm"
				>
					<Trash2 className="size-4" />
					{config.resetResponsesButton}
				</button>
			</div>

			{/* Overview */}
			<div className="rounded-lg bg-slate-50 p-4">
				<div className="text-3xl font-bold">{getTotalResponses()}</div>
				<div className="text-sm text-slate-600">{config.totalResponses}</div>
			</div>

			{/* Filter */}
			<div className="flex gap-2">
				<select
					value={selectedObjectId || ''}
					onChange={(e) => setSelectedObjectId(e.target.value || null)}
					className="km-input"
				>
					<option value="">All Objects</option>
					{sortedObjects.map((obj) => (
						<option key={obj.id} value={obj.id}>
							{obj.name}
						</option>
					))}
				</select>
				{selectedObjectId && (
					<button
						type="button"
						onClick={() => setSelectedObjectId(null)}
						className="km-btn-secondary"
					>
						<RefreshCw className="size-4" />
					</button>
				)}
			</div>

			{/* Stats per object */}
			<div className="space-y-6">
				{displayObjects.map((obj) => (
					<div key={obj.id} className="space-y-3">
						<h3 className="font-medium text-slate-900">{obj.name}</h3>

						{getQuestionsForObject(obj.id).map((q) => {
							const qResponses = getResponsesForQuestion(q.id);
							const totalResponses = qResponses.length;
							const skipCount = qResponses.filter(
								(r) => r.selectedOptionIndex === null
							).length;

							return (
								<QuestionStats
									key={q.id}
									questionText={q.text}
									options={q.options}
									responses={qResponses}
									totalResponses={totalResponses}
									skipCount={skipCount}
								/>
							);
						})}
					</div>
				))}
			</div>

			{sortedObjects.length === 0 && (
				<p className="text-center text-slate-500">{config.noResponses}</p>
			)}
		</div>
	);
};

interface QuestionStatsProps {
	questionText: string;
	options: string[];
	responses: Array<{ selectedOptionIndex: number | null }>;
	totalResponses: number;
	skipCount: number;
}

const QuestionStats: React.FC<QuestionStatsProps> = ({
	questionText,
	options,
	responses,
	totalResponses,
	skipCount
}) => {
	const getOptionCount = (optionIndex: number) => {
		return responses.filter((r) => r.selectedOptionIndex === optionIndex)
			.length;
	};

	const answeredCount = totalResponses - skipCount;

	return (
		<div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
			<div className="mb-3 flex items-start justify-between">
				<p className="font-medium">{questionText}</p>
				<div className="text-right text-sm text-slate-500">
					<span>{totalResponses} {config.responsesLabel}</span>
					{skipCount > 0 && (
						<span className="ml-2 text-amber-600">
							({skipCount} {config.skipCount.toLowerCase()})
						</span>
					)}
				</div>
			</div>

			{totalResponses === 0 ? (
				<p className="text-sm text-slate-500">{config.noResponses}</p>
			) : (
				<div className="space-y-2">
					{options.map((option, index) => {
						const count = getOptionCount(index);
						const percentage =
							answeredCount > 0 ? (count / answeredCount) * 100 : 0;

						return (
							<div key={index} className="space-y-1">
								<div className="flex justify-between text-sm">
									<span>{option}</span>
									<span className="text-slate-600">
										{count} ({percentage.toFixed(0)}%)
									</span>
								</div>
								<div className="h-2 overflow-hidden rounded-full bg-slate-200">
									<div
										className="h-full rounded-full bg-blue-500 transition-all"
										style={{ width: `${percentage}%` }}
									/>
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};
