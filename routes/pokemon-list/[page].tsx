import { Handlers, PageProps } from "$fresh/server.ts";

// ポケモンのデータ型定義
interface PokemonSummary {
  name: string;
  id: string;
}

interface PokemonList {
  count: number;
  next: string | null;
  previous: string | null;
  results: PokemonSummary[];
  page: number;
}

export const handler: Handlers = {
  async GET(_, ctx) {
    const { page } = ctx.params;
    const apiBaseUrl = Deno.env.get("API_BASE_URL") || "http://localhost:8000";
    const response = await fetch(`${apiBaseUrl}/api/pokemon-list/${page}`);
    if (!response.ok) {
      return ctx.render(null);
    }
    const data: PokemonList = await response.json();
    data.page = parseInt(page);
    return ctx.render(data);
  },
};

export default function PokemonListPage({ data }: PageProps<PokemonList>) {
  const firstPokemonIndex = (data.page - 1) * 100 + 1;
  const lastPokemonIndex = Math.min(data.page * 100, parseInt(Deno.env.get("MAX_POKE_NUM") || "1025"));

  return (
    <div class="container">
      <div id="top"></div>
      <div class="pagination">
        <a
          href={`/pokemon-list/${data.page - 1}`}
          class={`button ${!data.previous ? "disabled" : ""}`}
          aria-disabled={!data.previous ? "true" : "false"}
        >
          前のページ
        </a>
        <a href="/" class="button">トップ画面に戻る</a>
        <a
          href={`/pokemon-list/${data.page + 1}`}
          class={`button ${!data.next ? "disabled" : ""}`}
          aria-disabled={!data.next ? "true" : "false"}
        >
          次のページ
        </a>
      </div>
      <h1>
        ポケモン一覧(ページ {data.page}) - No.{firstPokemonIndex} ~ {lastPokemonIndex}
      </h1>
      <table>
        <thead>
          <tr>
            <th>No.</th>
            <th>画像</th>
            <th>名前</th>
          </tr>
        </thead>
        <tbody>
          {data.results.map((pokemon) => (
            <tr key={pokemon.id}>
              <td>{pokemon.id}</td>
              <td>
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  alt={`${pokemon.name}の画像`}
                  class="pokemon-list-image"
                />
              </td>
              <td>
                <a href={`/pokemon/${pokemon.id}`} class="pokemon-link">
                  {pokemon.name}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div class="bottom-navigation">
        <a href="#top" class="button">
          一番上に移動
        </a>
      </div>
    </div>
  );
}
