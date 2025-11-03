"use client";
import { usePokemonStore } from "~/app/stores/pokemon.store";
import ItemList from "./_components/itemList";
import type { IPokemon } from "~/types/pokemon";
import Filter from "./_components/filter";

function ClientApp({ initialPokemons }: { initialPokemons: IPokemon[] }) {
  const { filteredPokemons, init } = usePokemonStore();
  init(initialPokemons);

  return (
    <div className="flex h-full w-full flex-col gap-2 overflow-y-auto p-3">
      <Filter />
      {filteredPokemons.map((pokemon) => (
        <ItemList key={pokemon.name} pokemon={pokemon} />
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
