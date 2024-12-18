import { useState } from "preact/hooks";

export default function SearchForm() {
  const [pokedexNo, setPokedexNo] = useState("");

  const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    setPokedexNo(target.value);
  };

  const randomSearch = () => {
    const randomNo = Math.floor(Math.random() * parseInt(Deno.env.get("MAX_POKE_NUM") || "1025"))  + 1;
    globalThis.location.href = `/pokemon/${randomNo}`;
  };

  const searchPokemon = () => {
    if (pokedexNo) {
      globalThis.location.href = `/pokemon/${pokedexNo}`;
    }
  };

  return (
    <div class="search-form">
      <input
        type="number"
        placeholder="図鑑No."
        value={pokedexNo}
        onInput={handleInput}
      />
      <button onClick={searchPokemon}>検索</button>
      <button onClick={randomSearch}>ランダム検索</button>
    </div>
  );
}
