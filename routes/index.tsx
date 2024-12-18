import SearchForm from "../islands/SearchForm.tsx";

export default function HomePage() {
  return (
    <div class="container">
      <h1>ポケモン図鑑</h1>
      <img src="pokeball.png" alt="Pokeball" class="pokeball" />
      <a href="/pokemon-list/1" class="button">ポケモン一覧</a>
      <SearchForm />
    </div>
  );
}