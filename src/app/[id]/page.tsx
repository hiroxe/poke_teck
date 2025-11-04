import { notFound } from "next/navigation";
import { api, HydrateClient } from "~/trpc/server";
import PokemonClientDetail from "./pageClient";

type Props = { params: { id: string } | Promise<{ id: string }> };

export default async function Page({ params }: Props) {
  const { id } = await params;

  try {
    const pokemon = await api.pokemon.getPokemonById(id);

    if (!pokemon) {
      return notFound();
    }

    return (
      <HydrateClient>
        <PokemonClientDetail pokemon={pokemon} />
      </HydrateClient>
    );
  } catch (error) {
    console.error("Error fetching pokemon by id:", error);
    return notFound();
  }
}
