import { api, HydrateClient } from "~/trpc/server";
import PokemonClientDetail from "./pageClient";

export default async function Page({ params }: { params: { id: string } }) {
  return (
    <HydrateClient>
      <PokemonClientDetail id={params.id} />
    </HydrateClient>
  );
}
