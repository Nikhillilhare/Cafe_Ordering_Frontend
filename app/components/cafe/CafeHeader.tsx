'use client';

type CafeHeaderProps ={
    cafeName:string;
    description:string|null;
    search:string;
    cartItemCount:number;
    onSearchChange:(value:string)=> void;
    onCartClick:()=>void;
};

export default function CafeHeader({
    cafeName,
    description,
    search,
    cartItemCount,
    onSearchChange,
    onCartClick,
}:CafeHeaderProps){
    return(
          <header className="mb-10">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--primary-color)]">
            Cafe menu
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            {cafeName}
          </h1>
        </div>

        <button
          onClick={onCartClick}
          className="relative rounded-full px-5 py-3 text-sm font-bold text-white"
          style={{
            backgroundColor: 'var(--primary-color)',
          }}
        >
          Cart

          {cartItemCount > 0 && (
            <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--accent-color)] text-xs text-[var(--text-color)]">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>

      {description && (
        <p className="mt-5 max-w-2xl text-lg text-[var(--muted-color)]">
          {description}
        </p>
      )}

      <input
        type="search"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search coffee, tea, snacks..."
        className="mt-7 w-full rounded-2xl border border-black/10 bg-(--surface-color) px-5 py-4 outline-none placeholder:text-(--muted-color) focus:ring-2"
        style={{
          '--tw-ring-color': 'var(--primary-color)',
        } as React.CSSProperties}
      />
    </header>
    );
}