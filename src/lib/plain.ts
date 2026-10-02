// A text field may be a bare string or { text, kind } (see EDITABLE-CONTRACT.md,
// "Variable-kind fields"). <Editable> unwraps either shape itself; anywhere else
// a field's value is read as a plain string (an alt attribute, aria-label, data
// attribute, JSON-LD, a .join()), unwrap it with this first.
export type VariableKindText = string | { text: string; kind: 'text' | 'html' };

export function plain(value: VariableKindText): string {
	return typeof value === 'object' && value !== null ? value.text : value;
}
