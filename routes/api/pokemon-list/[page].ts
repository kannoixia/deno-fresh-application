// routes/api/pokemon/[id].ts
import { Handlers } from "$fresh/server.ts";

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

export const handler: Handlers = {
  async GET(_, ctx) {
    const page = parseInt(ctx.params.page || "1");
    const limit = 100;
    const offset = (page - 1) * limit;

    try {
      // ポケモンリスト
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      if (!response.ok) throw new Error("Pokemon List not found");
      const responseData = await response.json();
      // リストデータの加工
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

      return new Response(
        JSON.stringify({
          count: responseData.count,
          next: responseData.next,
          previous: responseData.previous,
          results: filteredResults,
        }),
        {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, OPTIONS",
          },
        }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
    }
  },
};
