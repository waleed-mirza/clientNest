export function PageSkeleton() {
  return (
    <div className="cn-page-skeleton grid gap-8" aria-busy="true" aria-label="Loading">
      <div className="grid gap-3">
        <div className="cn-skel h-8 w-48" />
        <div className="cn-skel h-4 w-80 max-w-full" />
      </div>
      <div className="divide-y divide-border bg-surface">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="grid flex-1 gap-2">
              <div className="cn-skel h-4 w-44 max-w-[70%]" />
              <div className="cn-skel h-3 w-28 max-w-[40%]" />
            </div>
            <div className="cn-skel h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
