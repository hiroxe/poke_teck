import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  PokemonClient,
  GameClient,
  EvolutionClient,
  type ChainLink,
  type EvolutionChain,
  type Type,
} from "pokenode-ts";
import type {
  EvolutionUrlChain,
  IPokemon,
  IPokemonList,
  IPokemonType,
  IType,
} from "~/types/pokemon";
import axios from "axios";

const client = new PokemonClient();
const gameClient = new GameClient();
const evolutionClient = new EvolutionClient();
const GENERATION_TEXT = "generation-";
const MAX_POKEMON_COUNT = 1328;

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

const getEvolutionChains = async (
  urls: string[],
): Promise<EvolutionUrlChain[]> => {
  const results = await Promise.all(
    urls.map(async (url) => {
      const response = await axios.get<EvolutionChain>(url);
      const names = getSpeciesNames(response.data.chain);
      return { url, names };
    }),
  );
  return results;
};

const assignEvolutionData = (
  pokemon: IPokemon,
  evoChain: EvolutionUrlChain,
): IPokemon => {
  const { names } = evoChain;
  const currentIndex = names.indexOf(pokemon.name);

  pokemon.evolutionChainNames = names;
  pokemon.preevolutions = names.filter((_, i) => i < currentIndex);
  pokemon.evolutions = names.filter((_, i) => i > currentIndex);

  return pokemon;
};

async function assignGenerations(results: IPokemonList[]) {
  const generations = await gameClient.listGenerations();

  const generationDetails = await Promise.all(
    generations.results.map((g) => gameClient.getGenerationByName(g.name)),
  );

  const generationMap = new Map<string, string>();

  for (const gen of generationDetails) {
    const genCode = gen.name.replace(GENERATION_TEXT, "").toUpperCase();

    for (const species of gen.pokemon_species) {
      generationMap.set(species.name, genCode);
    }
  }

  results.forEach((pokemon) => {
    pokemon.generation = generationMap.get(pokemon.name) ?? "";
  });

  return results;
}

async function assignTypes(results: IPokemonList[]) {
  const typesList = await client.listTypes(0, 50);

  const typeDetails = await Promise.all(
    typesList.results.map(async (t) => {
      const type = await client.getTypeByName(t.name);
      return type as IType;
    }),
  );
  const typeMap = new Map<string, IPokemonType[]>();

  for (const type of typeDetails) {
    for (const poke of type.pokemon) {
      const name = poke.pokemon.name;
      const existing = typeMap.get(name) ?? [];
      const spriteUrl =
        type.sprites?.["generation-viii"]?.["sword-shield"]?.name_icon ?? "";

      existing.push({
        name: type.name,
        sprite: spriteUrl,
      });
      typeMap.set(name, existing);
    }
  }

  results.forEach((pokemon) => {
    pokemon.types = typeMap.get(pokemon.name) ?? [];
  });

  return results;
}

export const assignEvolutionChainsToList = async (results: IPokemonList[]) => {
  const evolutionList = await evolutionClient.listEvolutionChains(0, 600);
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

export const pokemonRouter = createTRPCRouter({
  getPokemonById: publicProcedure
    .input(z.string().min(1))
    .query(async ({ input }) => {
      const pokemon = await client.getPokemonByName(input);
      return pokemon as IPokemon;
    }),

  list: publicProcedure.query(async () => {
    const list = await client.listPokemons(0, MAX_POKEMON_COUNT);
    const results = (list.results as IPokemonList[]) ?? [];
    results.forEach((pokemon, index) => {
      pokemon.id = index + 1;
    });

    await assignGenerations(results);
    await assignTypes(results);
    await assignEvolutionChainsToList(results);

    return results;
  }),
});

export type PokemonRouter = typeof pokemonRouter;
