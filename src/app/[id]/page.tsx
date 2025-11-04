import { api, HydrateClient } from "~/trpc/server";
import PokemonClientDetail from "./pageClient";

export default async function Page({ params }: { params: { id: string } }) {
  const pokemon = await api.pokemon.getPokemonById(params.id);
  return (
    <HydrateClient>
      <PokemonClientDetail pokemon={pokemon} />
    </HydrateClient>
  );
}
