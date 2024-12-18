// routes/api/pokemon/[id].ts
import { Handlers } from "$fresh/server.ts";

// 言語情報
interface Language {
  name: string; // 言語名 ("ja" など)
  url: string;  // 言語情報へのURL
}

// 名前情報
interface Name {
  language: Language; // 言語情報
  name: string;       // ポケモン名またはタイプ名
}

// 分類情報
interface Genera {
  genus: string;      // 分類 ("ねずみポケモン" など)
  language: Language; // 言語情報
}

// 説明文情報
interface FlavorTextEntry {
  flavor_text: string; // 説明文
  language: Language;  // 言語情報
  version: {
    name: string;      // バージョン名 ("x" など)
    url: string;       // バージョン情報へのURL
  };
}

interface Type {
  name: string;  // タイプ名（例: "electric"）
  url: string;   // タイプ情報のURL（例: "https://pokeapi.co/api/v2/type/13/"）
}

interface TypeObj {
  slot: number;  // スロット番号（ポケモンのタイプの順番）
  type: Type;    // タイプ情報（`name` と `url` を含む）
}

export const handler: Handlers = {
  async GET(_, ctx) {
    const { id } = ctx.params;

    try {
      // ポケモン情報取得
      const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      if (!pokemonRes.ok) throw new Error("Pokemon not found");
      const pokemonData = await pokemonRes.json();

      // 名前（日本語名）取得
      const speciesUrl = pokemonData.species?.url;
      if (!speciesUrl) throw new Error("Species URL is undefined");
      const speciesRes = await fetch(speciesUrl);
      if (!speciesRes.ok) throw new Error("Species not found");
      const speciesData = await speciesRes.json();
      const japaneseName = speciesData.names.find((v: Name) => v.language.name === "ja")?.name;

      // タイプ取得
      const types = await Promise.all(
        pokemonData.types.map(async (typeObj: TypeObj) => {
          // URLにアクセスしてタイプデータを取得
          const typeRes = await fetch(typeObj.type.url);
          if (!typeRes.ok) throw new Error(`Failed to fetch type data for ${typeObj.type.name}`);
          const typeData = await typeRes.json();
          // 日本語名を取得
          const japaneseTypeName = typeData.names.find((v: Name) => v.language.name === "ja")?.name;

          return japaneseTypeName;
        })
      );

      // 分類取得
      const genus = speciesData.genera.find((v: Genera) => v.language.name === "ja")?.genus;

      // 説明文取得
      const flavorTextEntries = speciesData.flavor_text_entries;
      const preferredVersions = ["sword", "sun", "x"];
      let flavorText = "説明文が見つかりませんでした。";
      for (const version of preferredVersions) {
        // 日本語の説明文を探す
        const entry = flavorTextEntries.find(
          (v: FlavorTextEntry) => v.language.name === "ja" && v.version.name === version
        );
        if (entry) {
          flavorText = entry.flavor_text;
          break;
        }
      }

      return new Response(
        JSON.stringify({
          name: japaneseName,
          image: pokemonData.sprites.other["official-artwork"].front_default,
          types,
          genus,
          description: flavorText,
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
