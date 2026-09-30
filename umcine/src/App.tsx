/*
 * 컴포넌트 트리
 *
 * App
 * ├── Header
 * └── MovieList
 *     ├── MovieCard
 *     │   └── MovieTitle
 *     └── MovieCard
 *         └── MovieTitle
 *
 * - App: Header와 MovieList의 부모
 * - MovieList: App의 자식이자 MovieCard의 부모
 * - MovieCard: MovieList의 자식이자 MovieTitle의 부모
 */

function Header() {
  return (
    <header>
      <h1>UMCINE</h1>
    </header>
  );
}

function MovieTitle() {
  return <h2>오디세이</h2>;
}

function MovieCard() {
  return (
    <article>
      <MovieTitle />
      <p>2026.08.05</p>
    </article>
  );
}

function MovieList() {
  return (
    <section>
      <MovieCard />
      <MovieCard />
    </section>
  );
}

export default function App() {
  return (
    <main>
      <Header />
      <MovieList />
    </main>
  );
}
