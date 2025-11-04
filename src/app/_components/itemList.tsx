import Image from "next/image";
import React from "react";
import type { IPokemonList } from "~/types/pokemon";

type ItemListProps = {
  pokemon: IPokemonList;
  onClick?: () => void;
};

export default function ItemList({ pokemon, onClick }: ItemListProps) {
  return (
    <div
      className="flex w-full max-w-[900px] cursor-pointer flex-col items-center gap-4 rounded-xl border bg-white p-5 shadow-md backdrop-blur-sm transition hover:border-red-500 hover:bg-red-50 md:flex-row md:justify-between"
      onClick={onClick}
    >
      <div className="flex flex-row items-center gap-4">
        <h2 className="text-lg font-bold capitalize md:text-2xl">
          {pokemon.name}
        </h2>
        <div className="flex hidden max-w-[400px] flex-row gap-2 overflow-hidden text-ellipsis md:flex">
          {pokemon.evolutionChainNames.length > 1 &&
            pokemon.evolutionChainNames.map((name, index) => (
              <div key={name} className="flex flex-row items-center gap-2">
                <p
                  className={`${name === pokemon.name ? "text-md text-blue-300" : "text-sm"}`}
                >
                  {name}
                </p>
                <div>
                  {index < pokemon.evolutionChainNames.length - 1 ? "→" : ""}
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="flex flex-row items-center gap-4">
        <div className="flex flex-row gap-4">
          {pokemon.types.map((type) => (
            <div key={type.name} className="flex flex-col items-center">
              <Image
                src={type.sprite}
                alt={type.name}
                width={120}
                height={40}
              />
            </div>
          ))}
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-full border">
          {pokemon.generation}
        </div>
      </div>
    </div>
  );
}
