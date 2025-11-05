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

const getSpeciesNames = (chain?: ChainLink, names: string[] = []): string[] => {
  if (!chain) return names;
  if (chain?.species?.name) {
    names.push(chain.species.name);
  }
  if (chain?.evolves_to?.length) {
    chain.evolves_to.forEach((evo: ChainLink) => getSpeciesNames(evo, names));
  }
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
  const evolutionChainNames = getSpeciesNames(evoResponse.data.chain);
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
      const names = getSpeciesNames(response.data.chain);
      return { url, names };
    }),
  );

  results.forEach((pokemon) => {
    const chaindFound = chainsData.find((chain) =>
      chain.names.includes(pokemon.name),
    );
    if (chaindFound) {
      pokemon.evolutionChainNames = chaindFound.names;
    } else {
      pokemon.evolutionChainNames = [];
    }
  });

  return results;
};
