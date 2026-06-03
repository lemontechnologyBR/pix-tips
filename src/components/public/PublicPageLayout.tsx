import { Footer } from "@/components/landing/Footer";
import { Navbar } from "@/components/landing/Navbar";

export function PublicPageLayout({
  children,
  narrow = false,
}: {
  children: React.ReactNode;
  narrow?: boolean;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div
          className={`mx-auto px-4 sm:px-6 ${narrow ? "max-w-3xl" : "max-w-4xl"}`}
        >
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}

export function PageHeader({
  title,
  description,
  updatedAt,
}: {
  title: string;
  description?: string;
  updatedAt?: string;
}) {
  return (
    <header className="mb-10 border-b border-zinc-800 pb-8">
      <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-lg leading-relaxed text-zinc-400">{description}</p>
      )}
      {updatedAt && (
        <p className="mt-4 text-sm text-zinc-600">Última atualização: {updatedAt}</p>
      )}
    </header>
  );
}

export function LegalSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="prose-legal mt-4 space-y-4 text-sm leading-relaxed text-zinc-400">
        {children}
      </div>
    </section>
  );
}

export function LegalNav({ items }: { items: { id: string; label: string }[] }) {
  return (
    <nav
      aria-label="Índice do documento"
      className="mb-10 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Nesta página
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="text-cyan-400 transition hover:text-cyan-300"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
