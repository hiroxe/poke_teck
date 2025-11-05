import { GameClient } from "pokenode-ts";
import type { IPokemonList } from "~/types/pokemon";
import { GENERATION_TEXT } from "./constants";
const gameClient = new GameClient();

export async function assignGenerations(results: IPokemonList[]) {
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
