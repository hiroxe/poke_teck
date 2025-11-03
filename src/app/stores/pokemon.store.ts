import { create } from "zustand";
import type { IPokemon } from "~/types/pokemon";

type PokemonState = {
  pokemons: IPokemon[];
  filteredPokemons: IPokemon[];
  searchFilter?: string;
  typefilter: string[];
  generationFilter: string[];
  setSearchFilter: (filter: string) => void;
  setTypeFilter: (types: string[]) => void;
  setGenerationFilter: (generations: string[]) => void;
  setPokemons: (items: IPokemon[]) => void;
  clear: () => void;
  // init ya no llama al servidor; recibe datos precargados desde la Server Component
  init: (initial?: IPokemon[]) => void;
  filter(): void;
};

export const usePokemonStore = create<PokemonState>((set, get) => ({
  pokemons: [],
  filteredPokemons: [],
  searchFilter: undefined,
  typefilter: [],
  generationFilter: [],
  setTypeFilter: (types) => {
    set({ typefilter: types });
    get().filter();
  },
  setGenerationFilter: (generations) => {
    set({ generationFilter: generations });
    get().filter();
  },
  setPokemons: (items) => {
    set({ pokemons: items });
    get().filter();
  },
  setSearchFilter: (filter) => {
    set({ searchFilter: filter });
    get().filter();
  },
  clear: () => set({ pokemons: [] }),
  init: (initial) => {
    if (!initial) return;
    const { pokemons } = get();
    if (pokemons.length === 0) get().setPokemons(initial);
  },
  filter: () => {
    const { searchFilter, typefilter, generationFilter, pokemons } = get();
    if (
      !searchFilter &&
      typefilter.length === 0 &&
      generationFilter.length === 0
    ) {
      set({ filteredPokemons: pokemons });
      return;
    }

    set({
      filteredPokemons: pokemons.filter((pokemon) => {
        const matchesSearch = pokemon.evolutionChainNames.some((name) =>
          name.toLowerCase().includes(searchFilter?.toLowerCase() ?? ""),
        );

        const matchesGeneration =
          generationFilter.length === 0 ||
          generationFilter.includes(pokemon.generation);

        const matchesType =
          typefilter.length === 0 ||
          pokemon.types
            .map((t) => t.type.name.toLowerCase())
            .some((type) => typefilter.includes(type));

        return matchesSearch && matchesGeneration && matchesType;
      }),
    });
  },
}));
