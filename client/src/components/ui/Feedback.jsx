export const Spinner = ({ className = "" }) => (
  <div
    className={`animate-spin rounded-full border-2 border-brand-100 border-t-brand-500 ${className}`}
  />
);

export const PageSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <Spinner className="w-8 h-8" />
  </div>
);

export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center text-center py-12 px-6">
    {icon && (
      <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-500 flex items-center justify-center mb-4">
        {icon}
      </div>
    )}
    <h3 className="font-semibold text-ink-900 mb-1">{title}</h3>
    {description && (
      <p className="text-sm text-ink-500 max-w-sm mb-4">{description}</p>
    )}
    {action}
  </div>
);
