import axios from "axios";
import {
  EvolutionClient,
  PokemonClient,
  type ChainLink,
  type EvolutionChain,
} from "pokenode-ts";
import type { IPokemon, IPokemonList } from "~/types/pokemon";
import { MAX_EVOLUTION_CHAIN } from "./constants";

const client = new PokemonClient();
const evolutionClient = new EvolutionClient();

const getSpeciesLines = (chain?: ChainLink): string[][] => {
  if (!chain) return [];

  const result: string[][] = [];

  const searchEvolutionRoute = (
    node: ChainLink | undefined | null,
    path: string[],
  ) => {
    if (!node) return;

    const name = node.species?.name ?? "";
    const newPath = name.trim() !== "" ? [...path, name] : [...path];

    const children = node.evolves_to ?? [];
    if (children.length === 0) {
      result.push(newPath);
      return;
    }
    children.forEach((child) => searchEvolutionRoute(child, newPath));
  };

  searchEvolutionRoute(chain, []);
  return result;
};

const getEvolutionChainNamesForPokemon = (
  pokemonName: string,
  evolutionLines: string[][],
): string[] => {
  const relevantLines = evolutionLines.filter((line) =>
    line.includes(pokemonName),
  );
  const names = Array.from(
    new Set(
      relevantLines
        .flat()
        .map((n) => n.trim())
        .filter((n) => n !== ""),
    ),
  );

  return names;
};

export async function parseEvolutionData(pokemon: IPokemon) {
  const species = await client.getPokemonSpeciesByName(pokemon.name);

  if (!species.evolution_chain?.url) {
    return {
      evolutionChainNames: [],
      preevolutions: [],
      evolutions: [],
    };
  }
  const evoResponse = await axios.get<EvolutionChain>(
    species.evolution_chain.url,
  );

  const evolutionLinesParsed = getSpeciesLines(evoResponse.data.chain);

  const evolutionChainNames = getEvolutionChainNamesForPokemon(
    pokemon.name,
    evolutionLinesParsed,
  );
  const currentIndex = evolutionChainNames.indexOf(pokemon.name);
  if (currentIndex === -1) {
    return {
      evolutionChainNames,
      preevolutions: [],
      evolutions: [],
    };
  }
  const preNames = evolutionChainNames.slice(0, currentIndex);
  const postNames = evolutionChainNames.slice(currentIndex + 1);

  const otherNames = [...preNames, ...postNames];
  const chainPokemons = await Promise.all(
    otherNames.map(async (name) => {
      const p = await client.getPokemonByName(name);
      return { name, sprite: p.sprites.front_default ?? "", id: p.id };
    }),
  );

  const findSprite = (name: string) =>
    chainPokemons.find((p) => p.name === name)?.sprite ?? "";

  const findId = (name: string) =>
    chainPokemons.find((p) => p.name === name)?.id ?? 0;

  return {
    evolutionChainNames,
    preevolutions: preNames.map((name) => ({
      name,
      sprite: findSprite(name),
      id: findId(name),
    })),
    evolutions: postNames.map((name) => ({
      name,
      sprite: findSprite(name),
      id: findId(name),
    })),
  };
}

export const assignEvolutionChainsToList = async (results: IPokemonList[]) => {
  const evolutionList = await evolutionClient.listEvolutionChains(
    0,
    MAX_EVOLUTION_CHAIN,
  );
  const urls = evolutionList.results.map((chain) => chain.url);

  const chainsData = await Promise.all(
    urls.map(async (url) => {
      const response = await axios.get<EvolutionChain>(url);
      const names = getSpeciesLines(response.data.chain);
      return { url, names };
    }),
  );

  results.forEach((pokemon) => {
    const chainFound = chainsData.find((chain) =>
      chain.names.some((line) => line.includes(pokemon.name)),
    );

    if (chainFound) {
      pokemon.evolutionChainNames = getEvolutionChainNamesForPokemon(
        pokemon.name,
        chainFound.names,
      );
    } else {
      pokemon.evolutionChainNames = [];
    }
  });

  return results;
};
