import { api, HydrateClient } from "~/trpc/server";
import ClientApp from "./pageClient";

export default async function Page() {
  const pokemons = await api.pokemon.list();

  return (
    <HydrateClient>
      <ClientApp initialPokemons={pokemons} />
    </HydrateClient>
  );
}
