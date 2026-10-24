import { Sparkles } from "lucide-react";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupButton,
	InputGroupText,
	InputGroupTextarea,
} from "#/components/ui/input-group";
import { MAX_PROMPT_LENGTH } from "../types";

type PickPromptFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

/**
 * A multi-line description box for AI picks. Enter submits the form and
 * Shift+Enter adds a new line.
 */
export function PickPromptField({ value, onChange }: PickPromptFieldProps) {
	return (
		<InputGroup>
			<InputGroupTextarea
				aria-label="Describe what you feel like watching"
				value={value}
				maxLength={MAX_PROMPT_LENGTH}
				rows={3}
				// The box sizes to its content, so it needs room for the placeholder,
				// which wraps onto four lines on a phone.
				className="min-h-30 md:min-h-20"
				autoFocus
				placeholder="Describe what you feel like watching. A cozy 90s mystery under 2 hours, something like Knives Out…"
				onChange={(e) => onChange(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter" && !e.shiftKey) {
						e.preventDefault();
						e.currentTarget.form?.requestSubmit();
					}
				}}
			/>
			<InputGroupAddon align="block-end">
				<InputGroupText className="tabular-nums">
					{value.length}/{MAX_PROMPT_LENGTH}
				</InputGroupText>
				<InputGroupButton
					type="submit"
					variant="contrast"
					size="sm"
					className="ml-auto px-3"
				>
					<Sparkles />
					Pick for me
				</InputGroupButton>
			</InputGroupAddon>
		</InputGroup>
	);
}
