export function BrowserMockup() {
  return (
    <div className="relative select-none" aria-hidden>
      <div
        aria-hidden
        className="absolute -inset-8 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand/15 via-success/10 to-transparent blur-3xl"
      />
      <div className="rounded-2xl border bg-white shadow-elegant overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b bg-secondary/40">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink/15" />
          </div>
          <div className="ml-3 flex-1 max-w-[220px] mx-auto rounded-md bg-white border px-3 py-1 text-[11px] text-ink-soft text-center font-mono">
            pandadesign.hu
          </div>
        </div>
        <div className="p-7 md:p-9 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-md bg-brand" />
              <div className="h-2.5 w-20 rounded-full bg-ink/70" />
            </div>
            <div className="hidden sm:flex items-center gap-3">
              <div className="h-1.5 w-8 rounded-full bg-ink/15" />
              <div className="h-1.5 w-10 rounded-full bg-ink/15" />
              <div className="h-1.5 w-6 rounded-full bg-ink/15" />
              <div className="h-6 w-20 rounded-md bg-success" />
            </div>
          </div>
          <div className="mt-8 space-y-3">
            <div className="h-5 w-11/12 rounded bg-ink" />
            <div className="h-5 w-8/12 rounded bg-ink/85" />
            <div className="h-2.5 w-9/12 rounded-full bg-ink/20 mt-3" />
            <div className="h-2.5 w-7/12 rounded-full bg-ink/20" />
            <div className="flex gap-2 pt-4">
              <div className="h-9 w-32 rounded-lg bg-brand" />
              <div className="h-9 w-28 rounded-lg border-2 border-ink/15" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-8">
            <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-brand/20 to-brand/5" />
            <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-success/25 to-success/5" />
            <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-ink/12 to-ink/0" />
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -left-4 md:-left-8 w-40 md:w-48 rotate-[-5deg] hidden sm:block">
        <div className="rounded-2xl border bg-white shadow-elegant overflow-hidden">
          <div className="h-5 bg-secondary/60 border-b" />
          <div className="p-3.5 space-y-2">
            <div className="h-2 w-2/3 rounded-full bg-ink/70" />
            <div className="h-1.5 w-1/2 rounded-full bg-ink/20" />
            <div className="h-16 rounded-lg bg-gradient-to-br from-success/25 to-brand/15" />
            <div className="flex items-center justify-between pt-1">
              <div className="h-1.5 w-8 rounded-full bg-ink/20" />
              <div className="h-4 w-10 rounded-md bg-success" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -top-4 -right-4 hidden md:block rotate-[6deg]">
        <div className="rounded-xl border bg-white shadow-elegant px-3.5 py-2.5 flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-success/20 grid place-items-center">
            <div className="h-2 w-2 rounded-full bg-success" />
          </div>
          <div>
            <div className="h-1.5 w-16 rounded-full bg-ink/70 mb-1" />
            <div className="h-1.5 w-10 rounded-full bg-ink/20" />
          </div>
        </div>
      </div>
    </div>
  );
}