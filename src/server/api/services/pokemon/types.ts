import { PokemonClient } from "pokenode-ts";
import type {
  IPokemon,
  IPokemonList,
  IPokemonType,
  IType,
} from "~/types/pokemon";
import { MAX_TYPE_COUNT } from "./constants";
const client = new PokemonClient();

export async function assignTypes(results: IPokemonList[]) {
  const typesList = await client.listTypes(0, MAX_TYPE_COUNT);

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

export async function parsePokemonTypes(pokemon: IPokemon) {
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
