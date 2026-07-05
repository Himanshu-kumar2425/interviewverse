export default function Spinner({ fullscreen = false, size = "md" }) {
  const sizes = { sm: "h-4 w-4", md: "h-8 w-8", lg: "h-12 w-12" };

  const spinner = (
    <div
      className={`${sizes[size]} animate-spin rounded-full border-2 border-surface-600 border-t-brand-500`}
      role="status"
      aria-label="Loading"
    />
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-surface-900">
        {spinner}
      </div>
    );
  }

  return spinner;
}
