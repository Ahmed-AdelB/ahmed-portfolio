import React, { type FC, useCallback, useId, useMemo, useState } from 'react';
import { Loader2, Send } from 'lucide-react';

type SubmissionState = 'idle' | 'success' | 'error';

interface SubmissionStatus {
  state: SubmissionState;
  message: string;
}

interface NewsletterFormProps {
  /** API endpoint that handles newsletter subscriptions */
  endpoint?: string;
  /** Placeholder for the email input */
  placeholder?: string;
  /** Button label for submit */
  submitLabel?: string;
  /** Success message shown after subscribing */
  successMessage?: string;
  /** Error message shown when the request fails */
  errorMessage?: string;
  /** Validation message when email is missing */
  requiredEmailMessage?: string;
  /** Validation message when email is invalid */
  invalidEmailMessage?: string;
  /** Optional wrapper class name */
  className?: string;
}

const DEFAULT_ENDPOINT = '/api/newsletter';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_COPY = {
  placeholder: 'Enter your email',
  submitLabel: 'Subscribe',
  successMessage: 'Thanks for subscribing! Please check your inbox to confirm.',
  errorMessage: 'Something went wrong. Please try again.',
  requiredEmailMessage: 'Email is required.',
  invalidEmailMessage: 'Please enter a valid email address.',
} as const;

const buildClassName = (...classes: Array<string | undefined>): string =>
  classes.filter(Boolean).join(' ');

const validateEmail = (
  value: string,
  requiredMessage: string,
  invalidMessage: string
): string | null => {
  if (!value.trim()) {
    return requiredMessage;
  }
  if (!EMAIL_PATTERN.test(value.trim())) {
    return invalidMessage;
  }
  return null;
};

const readMessage = (payload: unknown): string | null => {
  if (typeof payload !== 'object' || payload === null) return null;
  const record = payload as Record<string, unknown>;
  return typeof record.message === 'string' ? record.message : null;
};

const readSuccess = (payload: unknown): boolean | null => {
  if (typeof payload !== 'object' || payload === null) return null;
  const record = payload as Record<string, unknown>;
  return typeof record.success === 'boolean' ? record.success : null;
};

interface NewsletterFormState {
  email: string;
  emailError: string | null;
  status: SubmissionStatus;
  isSubmitting: boolean;
  handleEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleEmailBlur: () => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}

const useNewsletterForm = (options: {
  endpoint: string;
  successMessage: string;
  errorMessage: string;
  requiredEmailMessage: string;
  invalidEmailMessage: string;
}): NewsletterFormState => {
  const [email, setEmail] = useState<string>('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmissionStatus>({ state: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleEmailChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>): void => {
      setEmail(event.target.value);
      if (emailError) setEmailError(null);
      if (status.state !== 'idle') setStatus({ state: 'idle', message: '' });
    },
    [emailError, status.state],
  );

  const handleEmailBlur = useCallback((): void => {
    const validationMessage = validateEmail(
      email,
      options.requiredEmailMessage,
      options.invalidEmailMessage,
    );
    setEmailError(validationMessage);
  }, [email, options.invalidEmailMessage, options.requiredEmailMessage]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
      event.preventDefault();
      if (isSubmitting) return;

      const validationMessage = validateEmail(
        email,
        options.requiredEmailMessage,
        options.invalidEmailMessage,
      );
      if (validationMessage) {
        setEmailError(validationMessage);
        return;
      }

      setIsSubmitting(true);
      setStatus({ state: 'idle', message: '' });

      try {
        const response = await fetch(options.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim() }),
        });

        const payload = await response.json().catch(() => null);
        const apiMessage = readMessage(payload);
        const apiSuccess = readSuccess(payload);

        if (response.ok && (apiSuccess === null || apiSuccess)) {
          setStatus({
            state: 'success',
            message: apiMessage ?? options.successMessage,
          });
          setEmail('');
          setEmailError(null);
        } else {
          setStatus({
            state: 'error',
            message: apiMessage ?? options.errorMessage,
          });
        }
      } catch (error) {
        console.error('Newsletter subscription failed:', error);
        setStatus({ state: 'error', message: options.errorMessage });
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      email,
      isSubmitting,
      options.endpoint,
      options.errorMessage,
      options.invalidEmailMessage,
      options.requiredEmailMessage,
      options.successMessage,
    ],
  );

  return {
    email,
    emailError,
    status,
    isSubmitting,
    handleEmailChange,
    handleEmailBlur,
    handleSubmit,
  };
};

/**
 * NewsletterForm - Email signup form with Buttondown integration.
 *
 * @example
 * <NewsletterForm />
 */
export const NewsletterForm: FC<NewsletterFormProps> = ({
  endpoint = DEFAULT_ENDPOINT,
  placeholder = DEFAULT_COPY.placeholder,
  submitLabel = DEFAULT_COPY.submitLabel,
  successMessage = DEFAULT_COPY.successMessage,
  errorMessage = DEFAULT_COPY.errorMessage,
  requiredEmailMessage = DEFAULT_COPY.requiredEmailMessage,
  invalidEmailMessage = DEFAULT_COPY.invalidEmailMessage,
  className,
}) => {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const statusId = `${inputId}-status`;

  const {
    email,
    emailError,
    status,
    isSubmitting,
    handleEmailChange,
    handleEmailBlur,
    handleSubmit,
  } = useNewsletterForm({
    endpoint,
    successMessage,
    errorMessage,
    requiredEmailMessage,
    invalidEmailMessage,
  });

  const describedBy = useMemo<string | undefined>(() => {
    const ids: string[] = [];
    if (emailError) ids.push(errorId);
    if (status.state !== 'idle') ids.push(statusId);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }, [emailError, errorId, status.state, statusId]);

  return (
    <div className={buildClassName('mt-4', className)}>
      <form className="sm:flex sm:max-w-md" onSubmit={handleSubmit} noValidate>
        <label htmlFor={inputId} className="sr-only">
          Email address
        </label>
        <input
          id={inputId}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={handleEmailChange}
          onBlur={handleEmailBlur}
          required
          aria-required="true"
          aria-invalid={emailError ? 'true' : 'false'}
          aria-describedby={describedBy}
          placeholder={placeholder}
          disabled={isSubmitting}
          className="w-full min-w-0 appearance-none rounded-md border border-gray-300 bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-400 dark:focus:ring-indigo-400"
          inputMode="email"
        />
        <div className="mt-3 rounded-md sm:ms-3 sm:mt-0 sm:flex-shrink-0">
          <button
            type="submit"
            className="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-offset-gray-900"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            <span className="sr-only">{submitLabel}</span>
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </form>

      <div className="mt-2 space-y-2">
        {emailError && (
          <p id={errorId} className="text-sm text-red-600 dark:text-red-400" role="alert">
            {emailError}
          </p>
        )}

        {status.state !== 'idle' && (
          <div
            id={statusId}
            role={status.state === 'error' ? 'alert' : 'status'}
            aria-live={status.state === 'error' ? 'assertive' : 'polite'}
            className={buildClassName(
              'rounded-md px-3 py-2 text-sm',
              status.state === 'error'
                ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
            )}
          >
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
};
