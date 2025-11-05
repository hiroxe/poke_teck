"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { IPokemonList } from "~/types/pokemon";

type PokemonState = {
  pokemons: IPokemonList[];
  types: string[];
  generations: string[];
  filteredPokemons: IPokemonList[];
  searchFilter?: string;
  typefilter: string[];
  generationFilter: string[];
  setSearchFilter: (filter?: string) => void;
  setTypeFilter: (types: string[]) => void;
  setGenerationFilter: (generations: string[]) => void;
  setPokemons: (items: IPokemonList[]) => void;
  clear: () => void;
  clearFilters: () => void;
  init: (initial?: IPokemonList[]) => void;
  filter: () => void;
};

// NOTE: no default object with empty methods — use null and validate in hook
const PokemonContext = createContext<PokemonState | null>(null);

export function PokemonProvider({ children }: { children: React.ReactNode }) {
  const [pokemons, setPokemonsState] = useState<IPokemonList[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  const [generations, setGenerations] = useState<string[]>([]);
  const [filteredPokemons, setFilteredPokemons] = useState<IPokemonList[]>([]);
  const [searchFilter, setSearchFilterState] = useState<string | undefined>(
    undefined,
  );
  const [typefilter, setTypeFilterState] = useState<string[]>([]);
  const [generationFilter, setGenerationFilterState] = useState<string[]>([]);

  const computeFiltered = useCallback(() => {
    const filter = searchFilter?.toLowerCase() ?? "";
    const typesLower = typefilter.map((t) => t.toLowerCase());
    const gens = generationFilter;

    if (!filter && typesLower.length === 0 && gens.length === 0) {
      setFilteredPokemons(pokemons);
      return;
    }

    const typeSet = new Set(typesLower);

    const result = pokemons.filter((pokemon) => {
      const matchesSearch =
        !filter ||
        pokemon.evolutionChainNames.some((name) =>
          name.toLowerCase().includes(filter),
        );

      const matchesGeneration =
        gens.length === 0 ||
        (pokemon.generation != null && gens.includes(pokemon.generation));

      const pokemonTypesLower = pokemon.types.map((t) => t.name.toLowerCase());
      const matchesType =
        typeSet.size === 0 || pokemonTypesLower.some((t) => typeSet.has(t));

      return matchesSearch && matchesGeneration && matchesType;
    });

    setFilteredPokemons(result);
  }, [pokemons, searchFilter, typefilter, generationFilter]);

  useEffect(() => {
    computeFiltered();
  }, [computeFiltered]);

  const setPokemons = useCallback((items: IPokemonList[]) => {
    setPokemonsState(items);
  }, []);

  const setSearchFilter = useCallback((filter?: string) => {
    setSearchFilterState(filter);
  }, []);

  const setTypeFilter = useCallback((types: string[]) => {
    setTypeFilterState(types);
  }, []);

  const setGenerationFilter = useCallback((generations: string[]) => {
    setGenerationFilterState(generations);
  }, []);

  const clear = useCallback(() => {
    setPokemonsState([]);
    setFilteredPokemons(pokemons);
    setSearchFilterState(undefined);
    setTypeFilterState([]);
    setGenerationFilterState([]);
  }, []);

  const clearFilters = useCallback(() => {
    setSearchFilterState(undefined);
    setTypeFilterState([]);
    setGenerationFilterState([]);
  }, []);

  const init = useCallback(
    (initial?: IPokemonList[]) => {
      if (!initial || initial.length === 0) return;
      if (pokemons.length === 0) {
        setPokemonsState(initial);
        const allTypes = [
          ...new Set(initial.flatMap((p) => p.types.map((t) => t.name))),
        ];
        setTypes(allTypes);

        const uniqueTypes = [
          ...new Set(
            initial.flatMap((pokemon) =>
              pokemon.types
                .map((type) => type.name)
                .filter((type) => !!type.trim()),
            ),
          ),
        ];
        setTypes(uniqueTypes);

        const allGenerations = [
          ...new Set(
            initial
              .map((pokemon) => pokemon.generation)
              .filter((generation) => !!generation.trim()),
          ),
        ];
        setGenerations(allGenerations);
      }
    },
    [pokemons.length],
  );

  const filter = useCallback(() => {
    computeFiltered();
  }, [computeFiltered]);

  const value = useMemo(
    () => ({
      pokemons,
      filteredPokemons,
      searchFilter,
      typefilter,
      generations,
      types,
      generationFilter,
      setSearchFilter,
      setTypeFilter,
      setGenerationFilter,
      setPokemons,
      setTypes,
      setGenerations,
      clear,
      clearFilters,
      init,
      filter,
    }),
    [
      pokemons,
      filteredPokemons,
      searchFilter,
      typefilter,
      generations,
      types,
      generationFilter,
      setSearchFilter,
      setTypeFilter,
      setGenerationFilter,
      setPokemons,
      setTypes,
      setGenerations,
      clear,
      clearFilters,
      init,
      filter,
    ],
  );

  return (
    <PokemonContext.Provider value={value}>{children}</PokemonContext.Provider>
  );
}

// Hook that checks the context is provided
export function usePokemonContext(): PokemonState {
  const ctx = useContext(PokemonContext);
  if (ctx === null) {
    throw new Error(
      "usePokemonContext must be used within <PokemonProvider>. Did you forget to wrap your app in the provider?",
    );
  }
  return ctx;
}
