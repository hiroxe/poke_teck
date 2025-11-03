import { api, HydrateClient } from "~/trpc/server";
import ClientApp from "./pageClient";

export default async function Page() {
  const pokemons = await api.pokemon.list();

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <ClientApp initialPokemons={pokemons} />
    </HydrateClient>
  );
}
