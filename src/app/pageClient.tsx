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
    <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-3">
      <Filter />
      {filteredPokemons.map((pokemon) => (
        <ItemList
          key={pokemon.name}
          pokemon={pokemon}
          onClick={() => {
            router.push(`/${pokemon.id}`);
          }}
        />
      ))}
      {filteredPokemons.length === 0 && (
        <div className="flex h-[300px] w-full items-center justify-center text-2xl">
          Pokemon not found
        </div>
      )}
    </div>
  );
}

export default ClientApp;
