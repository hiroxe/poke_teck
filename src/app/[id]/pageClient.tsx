"use client";
import Image from "next/image";
import React, { useState } from "react";
import type { IPokemon } from "~/types/pokemon";
import { EvolutionList } from "../_components/evolutionList";
import { useRouter } from "next/navigation";

function PokemonClientDetail({ pokemon }: { pokemon: IPokemon }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    router.push("/");
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-3 md:p-8">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center opacity-20 grayscale-[50%] saturate-75"
        style={{ backgroundImage: "url('/background.png')" }}
      />
      <div className="flex flex-col gap-5 bg-white p-5">
        <div
          className="flex cursor-pointer items-center gap-2 font-semibold"
          onClick={handleClick}
        >
          {loading ? (
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-4 border-gray-400 border-t-transparent"></span>
          ) : (
            "BACK"
          )}
        </div>
        <div className="flex h-fit flex-col gap-3 sm:h-[250px] sm:flex-row">
          <div className="flex flex-col items-center">
            <p className="p-4 text-3xl font-bold capitalize">{pokemon?.name}</p>
            <div className="border-neutral-1000 relative rounded-lg border">
              <div className="absolute -top-4 -right-4 flex h-9 w-9 items-center justify-center rounded-full border bg-white">
                {pokemon.generation}
              </div>
              <Image
                src={pokemon.sprites.front_default ?? ""}
                alt={pokemon.name}
                width={150}
                height={150}
              />
            </div>
          </div>
          <div className="flex w-[250px] flex-col gap-5 p-5">
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
            <div className="flex h-full flex-col items-center justify-center gap-7">
              <EvolutionList
                title="Pre Evolutions"
                pokemons={pokemon.preevolutions}
              />
              <EvolutionList title="Evolutions" pokemons={pokemon.evolutions} />
            </div>
          </div>
        </div>
        <div className="flex w-full flex-col">
          {pokemon.stats.map((stat) => (
            <div
              key={stat.stat.name}
              className="flex flex-row justify-between gap-5 text-xl"
            >
              <span className="capitalize">{stat.stat.name}</span>
              <span>{stat.base_stat}</span>
            </div>
          ))}
        </div>
        <div className="flex w-full flex-col">
          <div className="flex flex-row justify-between gap-5 border-b pb-1 text-xl font-semibold">
            <span>Move</span>
            <span>Level</span>
          </div>

          {[...pokemon.moves]
            .sort(
              (a, b) =>
                (a.version_group_details[0]?.level_learned_at ?? 0) -
                (b.version_group_details[0]?.level_learned_at ?? 0),
            )
            .map((move) => {
              const level = move.version_group_details[0]?.level_learned_at;

              return (
                !!level && (
                  <div
                    key={move.move.name}
                    className="flex flex-row justify-between gap-5 py-1 text-xl"
                  >
                    <span className="capitalize">{move.move.name}</span>
                    <span>{level}</span>
                  </div>
                )
              );
            })}
        </div>
      </div>
    </div>
  );
}

export default PokemonClientDetail;
