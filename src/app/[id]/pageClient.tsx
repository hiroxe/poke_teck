"use client";
import React from "react";
import type { IPokemon } from "~/types/pokemon";

function PokemonClientDetail({ pokemon }: { pokemon: IPokemon }) {
  return <div className="p-4">hola {pokemon?.name}</div>;
}

export default PokemonClientDetail;
