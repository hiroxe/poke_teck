import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  PokemonClient,
  GameClient,
  EvolutionClient,
  type ChainLink,
  type EvolutionChain,
  type PokemonSpecies,
} from "pokenode-ts";
import type {
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

async function parsePokemonTypes(pokemon: IPokemon) {
  if (!pokemon.types) return [];

  const parsed = await Promise.all(
    pokemon.types.map(async (t) => {
      const typeDetail = (await client.getTypeByName(t.type.name)) as IType;
      const sprite =
        typeDetail?.sprites?.["generation-viii"]?.["sword-shield"]?.name_icon ??
        "";

      return { name: t.type.name, sprite };
    }),
  );

  return parsed;
}

async function parseEvolutionData(pokemon: IPokemon) {
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

export const pokemonRouter = createTRPCRouter({
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

  getPokemonById: publicProcedure
    .input(z.string().min(1))
    .query(async ({ input }) => {
      const [pokemon, species] = (await Promise.all([
        client.getPokemonByName(input),
        client.getPokemonSpeciesByName(input),
      ])) as [IPokemon, PokemonSpecies];

      pokemon.parsedTypes = await parsePokemonTypes(pokemon);
      pokemon.generation = (species.generation?.name ?? "")
        .replace(GENERATION_TEXT, "")
        .toUpperCase();

      const evolutionData = await parseEvolutionData(pokemon);

      pokemon.evolutionChainNames = evolutionData.evolutionChainNames;
      pokemon.preevolutions = evolutionData.preevolutions;
      pokemon.evolutions = evolutionData.evolutions;

      return pokemon;
    }),
});

export type PokemonRouter = typeof pokemonRouter;
