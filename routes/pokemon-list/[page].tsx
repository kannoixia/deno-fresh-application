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
}

interface PokemonPageProps {
  data: PokemonList;
  page: number;
}

interface Name {
  language: Language;
  name: string;
}

interface Language {
  name: string;
  url: string;
}

export const handler: Handlers<PokemonPageProps> = {
  async GET(_, ctx) {
    const page = parseInt(ctx.params.page || "1");
    const limit = 100;
    const offset = (page - 1) * limit;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    if (!response.ok) {
      return ctx.render({ data: { count: 0, next: null, previous: null, results: [] }, page });
    }
    const responseData = await response.json();
    const transformedResults = await Promise.all(
      responseData.results.map(async (pokemon: { url: string }) => {
        const id = parseInt(pokemon.url.split("/")[6]);

        // idが10000を超える場合はスキップ
        if (id > 10000) {
          return null;
        }
        const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
        if (!speciesRes.ok) throw new Error("Species not found");
        const speciesData = await speciesRes.json();
        const japaneseName = speciesData.names.find(
          (v: Name) => v.language.name === "ja"
        )?.name;

        return { name: japaneseName || "不明", id };
      })
    );

    const filteredResults = transformedResults.filter(result => result !== null);

    const data: PokemonList = {
      count: responseData.count,
      next: responseData.next,
      previous: responseData.previous,
      results: filteredResults,
    };

    return ctx.render({ data, page });
  },
};

export default function PokemonListPage({ data }: PageProps<PokemonPageProps>) {
  const firstPokemonIndex = (data.page - 1) * 100 + 1;
  const lastPokemonIndex = Math.min(data.page * 100, data.data.count);

  return (
    <div class="container">
      <div id="top"></div>
      <div class="pagination">
        <a
          href={`/pokemon-list/${data.page - 1}`}
          class={`button ${!data.data.previous ? "disabled" : ""}`}
          aria-disabled={!data.data.previous ? "true" : "false"}
        >
          前のページ
        </a>
        <a href="/" class="button">トップ画面に戻る</a>
        <a
          href={`/pokemon-list/${data.page + 1}`}
          class={`button ${!data.data.next ? "disabled" : ""}`}
          aria-disabled={!data.data.next ? "true" : "false"}
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
          {data.data.results.map((pokemon) => (
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
