"use client";
import Image from "next/image";
import React from "react";
import type { IPokemon } from "~/types/pokemon";
import { EvolutionList } from "../_components/evolutionList";

function PokemonClientDetail({ pokemon }: { pokemon: IPokemon }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-5 p-8">
      <div className="flex flex-row gap-3">
        <div className="flex flex-col items-center">
          <p className="p-4 text-2xl font-bold capitalize">{pokemon?.name}</p>
          <div className="border-neutral-1000 relative rounded-lg border">
            <div className="absolute -top-4 -right-4 flex h-9 w-9 items-center justify-center rounded-full border bg-white">
              {pokemon.generation}
            </div>
            <Image
              src={pokemon.sprites.front_default ?? ""}
              alt={pokemon.name}
              width={100}
              height={100}
            />
          </div>
        </div>
        <div className="flex w-[300px] flex-col gap-5 p-5">
          <div className="flex flex-row gap-3">
            {pokemon.parsedTypes.map((type, index) => (
              <Image
                key={index}
                src={type.sprite}
                width={120}
                height={40}
                alt={type.name}
              />
            ))}
          </div>
          <EvolutionList
            title="Pre Evolutions"
            pokemons={pokemon.preevolutions}
          />
          <EvolutionList title="Evolutions" pokemons={pokemon.evolutions} />
        </div>
      </div>
      <div className="flex flex-col">
        {pokemon.stats.map((stat) => (
          <div
            key={stat.stat.name}
            className="flex flex-row justify-between gap-2"
          >
            <span className="capitalize">{stat.stat.name}</span>
            <span>{stat.base_stat}</span>
          </div>
        ))}
      </div>
      {pokemon.location_area_encounters}
    </div>
  );
}

export default PokemonClientDetail;
