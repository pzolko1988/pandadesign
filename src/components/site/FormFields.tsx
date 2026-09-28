import type { ReactNode } from "react";

const INPUT_CLASS =
  "w-full rounded-xl border bg-background px-4 py-3 text-base outline-none transition focus:border-brand focus:ring-2 focus:ring-brand/30 aria-[invalid=true]:border-red-500 sm:text-sm";

type BaseFieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
};

function FieldShell({
  id,
  label,
  required,
  error,
  hint,
  children,
}: BaseFieldProps & { children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-semibold text-ink">
        {label}
        {required ? (
          <span aria-hidden="true"> *</span>
        ) : (
          <span className="font-normal text-ink-soft"> (nem kötelező)</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-ink-soft">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  if (error) {
    return `${id}-error`;
  }

  return hint ? `${id}-hint` : undefined;
}

export function TextField({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  autoComplete,
  inputMode,
  error,
  hint,
  maxLength,
  placeholder,
  onFocus,
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "url";
  maxLength?: number;
  placeholder?: string;
  onFocus?: () => void;
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
    >
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={INPUT_CLASS}
      />
    </FieldShell>
  );
}

export function SelectField({
  id,
  label,
  value,
  options,
  onChange,
  required = false,
  error,
  hint,
  placeholder,
  onFocus,
}: BaseFieldProps & {
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  onFocus?: () => void;
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
    >
      <select
        id={id}
        name={id}
        required={required}
        value={value}
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={INPUT_CLASS}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  value,
  onChange,
  required = false,
  error,
  hint,
  maxLength,
  rows = 5,
  placeholder,
  onFocus,
}: BaseFieldProps & {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  rows?: number;
  placeholder?: string;
  onFocus?: () => void;
}) {
  return (
    <FieldShell
      id={id}
      label={label}
      required={required}
      error={error}
      hint={hint}
    >
      <textarea
        id={id}
        name={id}
        required={required}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        value={value}
        onFocus={onFocus}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, error, hint)}
        className={`${INPUT_CLASS} resize-y leading-relaxed`}
      />
    </FieldShell>
  );
}

export function CheckboxField({
  id,
  checked,
  onChange,
  required = false,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div
        className={`flex items-start gap-3 rounded-xl border p-4 ${
          error ? "border-red-500" : ""
        }`}
      >
        <input
          id={id}
          name={id}
          type="checkbox"
          required={required}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]"
        />
        <label htmlFor={id} className="text-sm leading-relaxed text-ink-soft">
          {children}
        </label>
      </div>
      {error && (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Validációs segédfüggvények (a szerveroldali RPC ugyanezeket ellenőrzi)

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** "pelda.hu" → "https://pelda.hu/"; érvénytelen címnél üres string. */
export function normalizeWebsiteUrl(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  const candidate = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);

    if (!url.hostname.includes(".") || url.hostname.endsWith(".")) {
      return "";
    }

    return url.toString();
  } catch {
    return "";
  }
}

export function isMissingRpcError(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const record = error as { code?: string; message?: string };

  return (
    record.code === "PGRST202" ||
    (typeof record.message === "string" &&
      record.message.includes("Could not find the function"))
  );
}

/** A Postgres RPC által dobott, magyar nyelvű validációs hibaüzenet. */
export function readableSubmitError(error: unknown) {
  const message =
    error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : "";

  if (message && /[áéíóöőúüű]/i.test(message) && message.length < 200) {
    return message;
  }

  return "A beküldés most nem sikerült. Kérjük, próbáld újra – az adataid megmaradtak az űrlapon.";
}
