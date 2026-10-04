export default function Footer() {
  return (
    <footer className="border-t border-(--color-border-default) bg-(--color-bg-surface)">
      <div className="page-container flex h-14 items-center justify-end gap-2 text-xs text-(--color-text-secondary)">
        <img className="h-2.5" src="/images/logos/tmdb-logo.svg" alt="TMDB" />
        <p>
          This product uses the TMDB API but is not endorsed or certified by{" "}
          <a
            className="underline"
            href="https://www.themoviedb.org/"
            target="_blank"
            rel="noreferrer"
          >
            TMDB
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
