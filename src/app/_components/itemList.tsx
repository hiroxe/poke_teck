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
      className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border bg-white p-3 transition hover:border-red-500 hover:bg-red-100 md:flex-row md:justify-between"
      onClick={onClick}
    >
      <div className="flex flex-row items-center gap-2">
        <h2 className="text-lg font-bold capitalize md:text-2xl">
          {pokemon.name}
        </h2>
      </div>
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-row gap-2">
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
