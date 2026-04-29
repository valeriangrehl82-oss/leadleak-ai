"use client";

type ConfirmSubmitButtonProps = {
  children: React.ReactNode;
  message: string;
  className?: string;
};

export function ConfirmSubmitButton({ children, message, className }: ConfirmSubmitButtonProps) {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm(message)) {
          event.preventDefault();
        }
      }}
      className={
        className ||
        "rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-100"
      }
    >
      {children}
    </button>
  );
}
