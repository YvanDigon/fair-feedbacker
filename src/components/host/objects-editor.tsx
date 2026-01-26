import { config } from '@/config';
import { kmClient } from '@/services/km-client';
import { globalActions } from '@/state/actions/global-actions';
import { globalStore } from '@/state/stores/global-store';
import { cn } from '@/utils/cn';
import { useSnapshot } from '@kokimoki/app';
import { ChevronDown, ChevronUp, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import * as React from 'react';

export const ObjectsEditor: React.FC = () => {
	const { objects, questions } = useSnapshot(globalStore.proxy);
	const [expandedObjectId, setExpandedObjectId] = React.useState<string | null>(
		null
	);
	const [newObjectName, setNewObjectName] = React.useState('');
	const [isAdding, setIsAdding] = React.useState(false);

	const sortedObjects = Object.values(objects).sort(
		(a, b) => a.createdAt - b.createdAt
	);

	const handleAddObject = async () => {
		if (!newObjectName.trim()) return;
		setIsAdding(true);
		try {
			const id = await globalActions.addObject(newObjectName.trim(), '', null);
			setNewObjectName('');
			setExpandedObjectId(id);
		} finally {
			setIsAdding(false);
		}
	};

	const getQuestionsForObject = (objectId: string) => {
		return Object.values(questions)
			.filter((q) => q.objectId === objectId)
			.sort((a, b) => a.createdAt - b.createdAt);
	};

	return (
		<div className="space-y-4 rounded-xl border border-slate-200 bg-white p-6">
			<h2 className="text-lg font-semibold">{config.objectsSection}</h2>

			{/* Add new object */}
			<div className="flex gap-2">
				<input
					type="text"
					value={newObjectName}
					onChange={(e) => setNewObjectName(e.target.value)}
					placeholder={config.objectNamePlaceholder}
					className="km-input flex-1"
					onKeyDown={(e) => {
						if (e.key === 'Enter') handleAddObject();
					}}
				/>
				<button
					type="button"
					onClick={handleAddObject}
					disabled={isAdding || !newObjectName.trim()}
					className="km-btn-primary"
				>
					<Plus className="size-5" />
					{config.addObjectButton}
				</button>
			</div>

			{/* Objects list */}
			<div className="space-y-3">
				{sortedObjects.map((obj) => (
					<ObjectItem
						key={obj.id}
						object={obj}
						questions={getQuestionsForObject(obj.id)}
						isExpanded={expandedObjectId === obj.id}
						onToggle={() =>
							setExpandedObjectId(
								expandedObjectId === obj.id ? null : obj.id
							)
						}
					/>
				))}
			</div>
		</div>
	);
};

interface ObjectItemProps {
	object: {
		id: string;
		name: string;
		description: string;
		thumbnailUrl: string | null;
	};
	questions: Array<{
		id: string;
		type: 'single' | 'multiple' | 'open-ended' | 'rating';
		text: string;
		imageUrl: string;
		options: string[];
		randomizeOptions?: boolean;
		openEndedLength?: 'short' | 'long';
		ratingScale?: 5 | 7 | 10 | 11;
	}>;
	isExpanded: boolean;
	onToggle: () => void;
}

const ObjectItem: React.FC<ObjectItemProps> = ({
	object,
	questions,
	isExpanded,
	onToggle
}) => {
	const [isEditing, setIsEditing] = React.useState(false);
	const [name, setName] = React.useState(object.name);
	const [description, setDescription] = React.useState(object.description);
	const [isUploading, setIsUploading] = React.useState(false);
	const thumbnailInputRef = React.useRef<HTMLInputElement>(null);

	const handleSave = async () => {
		await globalActions.updateObject(object.id, { name, description });
		setIsEditing(false);
	};

	const handleDelete = async () => {
		if (confirm(`Delete "${object.name}" and all its questions?`)) {
			await globalActions.deleteObject(object.id);
		}
	};

	const handleThumbnailUpload = async (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		try {
			const upload = await kmClient.storage.upload(file.name, file, [
				'thumbnail',
				object.id
			]);
			await globalActions.updateObject(object.id, { thumbnailUrl: upload.url });
		} finally {
			setIsUploading(false);
			if (thumbnailInputRef.current) {
				thumbnailInputRef.current.value = '';
			}
		}
	};

	return (
		<div className="rounded-lg border border-slate-200 bg-slate-50">
			{/* Header */}
			<div
				className="flex cursor-pointer items-center justify-between p-4"
				onClick={onToggle}
			>
				<div className="flex items-center gap-3">
					{object.thumbnailUrl ? (
						<img
							src={object.thumbnailUrl}
							alt=""
							className="size-10 rounded-lg object-cover"
						/>
					) : (
						<div className="flex size-10 items-center justify-center rounded-lg bg-slate-200">
							<ImagePlus className="size-5 text-slate-400" />
						</div>
					)}
					<div>
						<h3 className="font-medium">{object.name}</h3>
						<p className="text-sm text-slate-500">
							{questions.length} {config.questionsSection.toLowerCase()}
						</p>
					</div>
				</div>
				{isExpanded ? (
					<ChevronUp className="size-5 text-slate-400" />
				) : (
					<ChevronDown className="size-5 text-slate-400" />
				)}
			</div>

			{/* Expanded content */}
			{isExpanded && (
				<div className="space-y-4 border-t border-slate-200 p-4">
					{isEditing ? (
						<div className="space-y-3">
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="km-input"
								placeholder={config.objectNamePlaceholder}
							/>
							<textarea
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								className="km-input max-w-full resize-none"
								rows={2}
								placeholder={config.objectDescriptionPlaceholder}
							/>
							<div className="flex gap-2">
								<input
									ref={thumbnailInputRef}
									type="file"
									accept="image/*"
									onChange={handleThumbnailUpload}
									className="hidden"
									id={`thumbnail-${object.id}`}
								/>
								<label
									htmlFor={`thumbnail-${object.id}`}
									className={cn(
										'km-btn-secondary cursor-pointer',
										isUploading && 'opacity-50'
									)}
								>
									{isUploading ? config.loading : config.uploadThumbnailButton}
								</label>
							</div>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={handleSave}
									className="km-btn-primary"
								>
									{config.saveObjectButton}
								</button>
								<button
									type="button"
									onClick={() => setIsEditing(false)}
									className="km-btn-neutral"
								>
									{config.cancelButton}
								</button>
							</div>
						</div>
					) : (
						<div className="flex justify-between">
							<div>
								{object.description && (
									<p className="text-sm text-slate-600">{object.description}</p>
								)}
							</div>
							<div className="flex gap-2">
								<button
									type="button"
									onClick={() => setIsEditing(true)}
									className="km-btn-secondary text-sm"
								>
									{config.editObjectButton}
								</button>
								<button
									type="button"
									onClick={handleDelete}
									className="km-btn-error text-sm"
								>
									<Trash2 className="size-4" />
								</button>
							</div>
						</div>
					)}

					{/* Questions */}
					<div className="space-y-3">
						<h4 className="font-medium">{config.questionsSection}</h4>
						<QuestionsEditor objectId={object.id} questions={questions} />
					</div>
				</div>
			)}
		</div>
	);
};

interface QuestionsEditorProps {
	objectId: string;
	questions: Array<{
		id: string;
		type: string;
		text: string;
		imageUrl: string;
		options: string[];
		randomizeOptions?: boolean;
		openEndedLength?: 'short' | 'long';
		ratingScale?: 5 | 7 | 10 | 11;
	}>;
}

const QuestionsEditor: React.FC<QuestionsEditorProps> = ({
	objectId,
	questions
}) => {
	const [isAddingQuestion, setIsAddingQuestion] = React.useState(false);
	const [newQuestionType, setNewQuestionType] = React.useState<'single' | 'multiple' | 'open-ended' | 'rating'>('single');
	const [newQuestionText, setNewQuestionText] = React.useState('');
	const [newQuestionImage, setNewQuestionImage] = React.useState('');
	const [newQuestionOptions, setNewQuestionOptions] = React.useState<string[]>([
		'',
		''
	]);
	const [randomizeOptions, setRandomizeOptions] = React.useState(false);
	const [openEndedLength, setOpenEndedLength] = React.useState<'short' | 'long'>('short');
	const [ratingScale, setRatingScale] = React.useState<5 | 7 | 10 | 11>(5);
	const [isUploading, setIsUploading] = React.useState(false);
	const imageInputRef = React.useRef<HTMLInputElement>(null);

	const handleAddQuestion = async () => {
		if (!newQuestionText.trim() || !newQuestionImage) return;
		
		// Validate based on question type
		if ((newQuestionType === 'single' || newQuestionType === 'multiple') && 
			newQuestionOptions.filter((o) => o.trim()).length < 2) {
			return;
		}

		await globalActions.addQuestion(
			objectId,
			newQuestionType,
			newQuestionText.trim(),
			newQuestionImage,
			newQuestionOptions.filter((o) => o.trim()),
			randomizeOptions,
			openEndedLength,
			ratingScale
		);

		// Reset form
		setNewQuestionType('single');
		setNewQuestionText('');
		setNewQuestionImage('');
		setNewQuestionOptions(['', '']);
		setRandomizeOptions(false);
		setOpenEndedLength('short');
		setRatingScale(5);
		setIsAddingQuestion(false);
	};

	const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		setIsUploading(true);
		try {
			const upload = await kmClient.storage.upload(file.name, file, [
				'question-image'
			]);
			setNewQuestionImage(upload.url);
		} finally {
			setIsUploading(false);
			if (imageInputRef.current) {
				imageInputRef.current.value = '';
			}
		}
	};

	const handleAddOption = () => {
		setNewQuestionOptions([...newQuestionOptions, '']);
	};

	const handleOptionChange = (index: number, value: string) => {
		const newOptions = [...newQuestionOptions];
		newOptions[index] = value;
		setNewQuestionOptions(newOptions);
	};

	const handleRemoveOption = (index: number) => {
		if (newQuestionOptions.length <= 2) return;
		const newOptions = newQuestionOptions.filter((_, i) => i !== index);
		setNewQuestionOptions(newOptions);
	};

	return (
		<div className="space-y-3">
			{/* Existing questions */}
			{questions.map((q, index) => (
				<QuestionItem key={q.id} question={q} index={index} />
			))}

			{/* Add new question */}
			{isAddingQuestion ? (
				<div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
					{/* Question Type Selector */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-slate-700">
							{config.questionTypeLabel}
						</label>
						<select
							value={newQuestionType}
							onChange={(e) => setNewQuestionType(e.target.value as 'single' | 'multiple' | 'open-ended' | 'rating')}
							className="km-input"
						>
							<option value="single">{config.questionTypeSingle}</option>
							<option value="multiple">{config.questionTypeMultiple}</option>
							<option value="open-ended">{config.questionTypeOpenEnded}</option>
							<option value="rating">{config.questionTypeRating}</option>
						</select>
					</div>

					{/* Question Text */}
					<input
						type="text"
						value={newQuestionText}
						onChange={(e) => setNewQuestionText(e.target.value)}
						placeholder={config.questionTextPlaceholder}
						className="km-input"
					/>

					{/* Image upload */}
					<div className="space-y-2">
						<label className="text-sm font-medium text-slate-700">
							{config.questionImageLabel}
						</label>
						{newQuestionImage ? (
							<div className="relative inline-block">
								<img
									src={newQuestionImage}
									alt="Question"
									className="h-24 w-auto rounded-lg border border-slate-200 object-cover"
								/>
								<button
									type="button"
									onClick={() => setNewQuestionImage('')}
									className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
								>
									<X className="size-3" />
								</button>
							</div>
						) : (
							<div>
								<input
									ref={imageInputRef}
									type="file"
									accept="image/*"
									onChange={handleImageUpload}
									className="hidden"
									id="new-question-image"
								/>
								<label
									htmlFor="new-question-image"
									className={cn(
										'km-btn-secondary cursor-pointer',
										isUploading && 'opacity-50'
									)}
								>
									{isUploading ? config.loading : config.uploadImageButton}
								</label>
							</div>
						)}
					</div>

					{/* Type-specific fields */}
					{(newQuestionType === 'single' || newQuestionType === 'multiple') && (
						<>
							{/* Options */}
							<div className="space-y-2">
								<label className="text-sm font-medium text-slate-700">
									{config.optionsLabel}
								</label>
								{newQuestionOptions.map((option, index) => (
									<div key={index} className="flex gap-2">
										<input
											type="text"
											value={option}
											onChange={(e) => handleOptionChange(index, e.target.value)}
											placeholder={`${config.optionPlaceholder} ${index + 1}`}
											className="km-input flex-1"
										/>
										{newQuestionOptions.length > 2 && (
											<button
												type="button"
												onClick={() => handleRemoveOption(index)}
												className="rounded-lg p-2 text-red-500 hover:bg-red-100"
											>
												<X className="size-4" />
											</button>
										)}
									</div>
								))}
								{newQuestionOptions.length < 7 && (
									<button
										type="button"
										onClick={handleAddOption}
										className="km-btn-secondary text-sm"
									>
										<Plus className="size-4" />
										{config.addOptionButton}
									</button>
								)}
							</div>

							{/* Randomize toggle */}
							<label className="flex items-center gap-2">
								<input
									type="checkbox"
									checked={randomizeOptions}
									onChange={(e) => setRandomizeOptions(e.target.checked)}
									className="size-4 rounded accent-blue-500"
								/>
								<span className="text-sm">{config.randomizeOptionsLabel}</span>
							</label>
						</>
					)}

					{newQuestionType === 'open-ended' && (
						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								{config.openEndedLengthLabel}
							</label>
							<select
								value={openEndedLength}
								onChange={(e) => setOpenEndedLength(e.target.value as 'short' | 'long')}
								className="km-input"
							>
								<option value="short">{config.openEndedShort}</option>
								<option value="long">{config.openEndedLong}</option>
							</select>
						</div>
					)}

					{newQuestionType === 'rating' && (
						<div className="space-y-2">
							<label className="text-sm font-medium text-slate-700">
								{config.ratingScaleLabel}
							</label>
							<select
								value={ratingScale}
								onChange={(e) => setRatingScale(Number(e.target.value) as 5 | 7 | 10 | 11)}
								className="km-input"
							>
								<option value={5}>{config.ratingScale5}</option>
								<option value={7}>{config.ratingScale7}</option>
								<option value={10}>{config.ratingScale10}</option>
								<option value={11}>{config.ratingScale11}</option>
							</select>
						</div>
					)}

					<div className="flex gap-2">
						<button
							type="button"
							onClick={handleAddQuestion}
							disabled={
								!newQuestionText.trim() ||
								!newQuestionImage ||
								((newQuestionType === 'single' || newQuestionType === 'multiple') && 
									newQuestionOptions.filter((o) => o.trim()).length < 2)
							}
							className="km-btn-primary"
						>
							{config.saveQuestionButton}
						</button>
						<button
							type="button"
							onClick={() => setIsAddingQuestion(false)}
							className="km-btn-neutral"
						>
							{config.cancelButton}
						</button>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setIsAddingQuestion(true)}
					className="km-btn-secondary text-sm"
				>
					<Plus className="size-4" />
					{config.addQuestionButton}
				</button>
			)}
		</div>
	);
};

interface QuestionItemProps {
	question: {
		id: string;
		type: string;
		text: string;
		imageUrl: string;
		options: string[];
		randomizeOptions?: boolean;
		openEndedLength?: 'short' | 'long';
		ratingScale?: 5 | 7 | 10 | 11;
	};
	index: number;
}

const QuestionItem: React.FC<QuestionItemProps> = ({ question, index }) => {
	const handleDelete = async () => {
		if (confirm(`Delete this question?`)) {
			await globalActions.deleteQuestion(question.id);
		}
	};

	const getTypeLabel = () => {
		switch (question.type) {
			case 'single': return config.questionTypeSingle;
			case 'multiple': return config.questionTypeMultiple;
			case 'open-ended': return config.questionTypeOpenEnded;
			case 'rating': return config.questionTypeRating;
			default: return 'Unknown';
		}
	};

	return (
		<div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
			<span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-medium">
				{index + 1}
			</span>
			<div className="flex-1 space-y-2">
				<div className="flex items-center gap-2">
					<p className="font-medium">{question.text}</p>
					<span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
						{getTypeLabel()}
					</span>
				</div>
				{question.imageUrl && (
					<img
						src={question.imageUrl}
						alt=""
						className="h-16 w-auto rounded-lg object-cover"
					/>
				)}
				{/* Show type-specific details */}
				{(question.type === 'single' || question.type === 'multiple') && (
					<div className="flex flex-wrap gap-1">
						{question.options.map((opt, i) => (
							<span
								key={i}
								className="rounded-full bg-slate-100 px-2 py-0.5 text-xs"
							>
								{opt}
							</span>
						))}
						{question.randomizeOptions && (
							<span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
								Randomized
							</span>
						)}
					</div>
				)}
				{question.type === 'open-ended' && (
					<span className="text-xs text-slate-500">
						{question.openEndedLength === 'short' ? config.openEndedShort : config.openEndedLong}
					</span>
				)}
				{question.type === 'rating' && (
					<span className="text-xs text-slate-500">
						{question.ratingScale} stars
					</span>
				)}
			</div>
			<button
				type="button"
				onClick={handleDelete}
				className="rounded-lg p-1 text-red-500 hover:bg-red-100"
			>
				<Trash2 className="size-4" />
			</button>
		</div>
	);
};
