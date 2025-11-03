import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import {
  PokemonClient,
  type ChainLink,
  type EvolutionChain,
} from "pokenode-ts";
import type { EvolutionUrlChain, IPokemon } from "~/types/pokemon";
import axios from "axios";

const client = new PokemonClient();
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

export const pokemonRouter = createTRPCRouter({
  getByNameOrId: publicProcedure
    .input(z.string().min(1))
    .query(async ({ input }) => {
      return client.getPokemonByName(input);
    }),

  list: publicProcedure.query(async () => {
    const list = await client.listPokemons(0, MAX_POKEMON_COUNT);
    const results = list.results ?? [];

    const detailed = (
      await Promise.all(
        results.map(async (r) => {
          try {
            const [pokemon, species] = await Promise.all([
              client.getPokemonByName(r.name),
              client.getPokemonSpeciesByName(r.name),
            ]);

            const generation = species?.generation?.name ?? null;

            return {
              ...pokemon,
              generation:
                generation.replace(GENERATION_TEXT, "").toUpperCase() ?? null,
              evolutionChainUrl: species.evolution_chain?.url ?? null,
              evolutionChainNames: [] as string[],
            } as IPokemon;
          } catch (err) {
            return null;
          }
        }),
      )
    )
      .filter((p): p is IPokemon => p !== null)
      .sort((a, b) => a.id - b.id);

    const evolutionChainUrls = Array.from(
      new Set(
        detailed
          .map((p) => p.evolutionChainUrl)
          .filter((url): url is string => url !== null),
      ),
    );

    const evolutionChains = await getEvolutionChains(evolutionChainUrls);

    detailed.forEach((pokemon) => {
      const evoChain = evolutionChains.find(
        (ec) => ec.url === pokemon.evolutionChainUrl,
      );

      if (evoChain) {
        return assignEvolutionData(pokemon, evoChain);
      }
    });

    return detailed;
  }),
});

export type PokemonRouter = typeof pokemonRouter;
