
'use client';

export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 pb-12 pt-16">
      <div className="flex flex-col-reverse gap-8 sm:flex-row sm:items-start sm:justify-between">
        {/* Name and tagline on the left */}
        <div>
          <p className="font-display text-5xl text-ac md:text-4xl">
            Ankita Deori
          </p>
          <p className="mt-3 max-w-[36ch] text-mu">
            Creative content with a clear point of view.
          </p>
        </div>

        {/* Social links and email on the right */}
        <nav
          aria-label="Social and contact links"
          className="flex flex-col items-start gap-3 font-mono text-sm sm:items-end sm:text-right"
        >
          <a
            className="ulink"
            href="https://www.instagram.com/ankitheexplorer_/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Instagram
          </a>
          <a
            className="ulink"
            href="https://www.linkedin.com/in/ankitadeori/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
          <a className="ulink" href="mailto:deoriankita2004@gmail.com">
            deoriankita2004@gmail.com
          </a>
        </nav>
      </div>

      <div className="mt-10 flex items-center justify-between font-mono text-xs text-mu">
        <span>© 2026 Ankita Deori</span>
        <button
          type="button"
          className="ulink"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}

