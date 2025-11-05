import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { PokemonClient, type PokemonSpecies } from "pokenode-ts";
import type { IPokemon, IPokemonList } from "~/types/pokemon";
import { assignGenerations } from "../services/pokemon/generation";
import { assignTypes, parsePokemonTypes } from "../services/pokemon/types";
import {
  assignEvolutionChainsToList,
  parseEvolutionData,
} from "../services/pokemon/evolution";
import {
  GENERATION_TEXT,
  MAX_POKEMON_COUNT,
} from "../services/pokemon/constants";
import { TRPCError } from "@trpc/server";

const client = new PokemonClient();

export const pokemonRouter = createTRPCRouter({
  list: publicProcedure.query(async () => {
    try {
      const list = await client.listPokemons(0, MAX_POKEMON_COUNT);
      const results = (list.results as IPokemonList[]) ?? [];
      results.forEach((pokemon, index) => {
        pokemon.id = index + 1;
      });

      await assignGenerations(results);
      await assignTypes(results);
      await assignEvolutionChainsToList(results);

      return results;
    } catch (e) {
      console.error("pokemon.list error:", e);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error fetching pokemon list",
      });
    }
  }),

  getPokemonById: publicProcedure
    .input(z.string().min(1))
    .query(async ({ input }) => {
      try {
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
      } catch (e) {
        console.error("pokemon.getPokemonById error:", e);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Error fetching pokemon ${input}`,
        });
      }
    }),
});

export type PokemonRouter = typeof pokemonRouter;
