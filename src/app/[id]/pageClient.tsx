"use client";
import React from "react";
import { usePokemonContext } from "~/context/PokemonProvider";

function PokemonClientDetail({ id }: { id: string }) {
  const { pokemons } = usePokemonContext();
  const pokemon = pokemons.find((p) => p.id.toString() === id);
  return <div className="p-4">hola {pokemon?.name}</div>;
}

export default PokemonClientDetail;
