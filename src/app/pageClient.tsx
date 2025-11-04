"use client";
import ItemList from "./_components/itemList";
import type { IPokemonList } from "~/types/pokemon";
import Filter from "./_components/filter";
import { usePokemonContext } from "~/context/PokemonProvider";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

function ClientApp({ initialPokemons }: { initialPokemons: IPokemonList[] }) {
  const { filteredPokemons, init, pokemons } = usePokemonContext();
  const router = useRouter();

  useEffect(() => {
    if (!initialPokemons?.length) return;
    if (pokemons.length > 0) return;
    init(initialPokemons);
  }, [initialPokemons, init, pokemons.length]);

  return (
    <div
      className="flex h-full min-h-screen w-full flex-col items-center justify-center gap-2 bg-fixed"
      style={{ backgroundImage: "url('/background.png')" }}
    >
      <div className="sticky top-0 z-10 flex w-full items-center justify-center bg-white p-2">
        <Filter />
      </div>
      <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start gap-2 overflow-y-auto">
        {filteredPokemons.map((pokemon) => (
          <ItemList
            key={pokemon.name}
            pokemon={pokemon}
            onClick={() => router.push(`/${pokemon.id}`)}
          />
        ))}
      </div>
    </div>
  );
}

export default ClientApp;
