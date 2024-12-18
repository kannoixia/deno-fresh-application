import { Handlers, PageProps } from "$fresh/server.ts";


// ポケモンデータ型定義
interface PokemonData {
  name: string;
  image: string;
  types: string[];
  genus: string;
  description: string;
  id: string;
}

const typeMap: { [key: string]: string } = {
  くさ: "grass",
  ほのお: "fire",
  みず: "water",
  でんき: "electric",
  こおり: "ice",
  かくとう: "fighting",
  どく: "poison",
  じめん: "ground",
  ひこう: "flying",
  エスパー: "psychic",
  むし: "bug",
  いわ: "rock",
  ゴースト: "ghost",
  ドラゴン: "dragon",
  あく: "dark",
  はがね: "steel",
  フェアリー: "fairy",
  ノーマル: "normal",
};

export const handler: Handlers = {
  async GET(_, ctx) {
    const { id } = ctx.params;
    const apiBaseUrl = Deno.env.get("API_BASE_URL") || "https://deno-fresh-pokemon-app.deno.dev";
    const response = await fetch(`${apiBaseUrl}/api/pokemon/${id}`);
    console.log("apiBaseURL:", apiBaseUrl)
    console.log("response:", response)
    if (!response.ok) {
      return ctx.render(null);
    }
    const data: PokemonData = await response.json();
    data.id = id;
    console.log("id:",id)
    return ctx.render(data);
  },
};


export default function PokemonPage({ data }: PageProps<PokemonData>) {

  if (!data) {
    return (
      <div class="container">
        <h1>ポケモンが見つかりませんでした。</h1>
        <a href="/" class="button">戻る</a>
      </div>
    );
  }

  const cleanDescription = data.description
    .replace(/\n/g, ' ')
    .replace(/\s+/g, '')
    .trim();

  return (
    <div class="container">
      <h1 class="pokemon-id">図鑑No. {data.id}</h1>
      <h1>{data.name}</h1>
      <img src={data.image} alt={`${data.name}の画像`} class="pokemon-image" />
      <p>種族: {data.genus}</p>
      <p>
        タイプ: {data.types.map((type) => {
          const englishType = typeMap[type] || "unknown";
          return (
            <span class={`type type-${englishType}`} key={type}>
              {type}
            </span>
          );
        })}
      </p>
      <p>説明: {cleanDescription}</p>
      <a href="/" class="button">トップページへ戻る</a>
    </div>
  );
}
