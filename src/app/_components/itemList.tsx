import Image from "next/image";
import React from "react";
import type { IPokemon } from "~/types/pokemon";

type ItemListProps = {
  pokemon: IPokemon;
  onClick?: () => void;
};

export default function ItemList({ pokemon, onClick }: ItemListProps) {
  return (
    <div
      className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-lg border bg-white p-3 transition hover:border-red-500 hover:bg-red-100 md:flex-row md:justify-between"
      onClick={onClick}
    >
      <div className="flex flex-row items-center gap-2">
        <Image
          src={pokemon.sprites.front_default ?? ""}
          alt={pokemon.name}
          width={60}
          height={60}
        />
        <h2 className="text-lg font-bold capitalize md:text-2xl">
          {pokemon.name}
        </h2>
      </div>
      <div className="flex flex-row items-center gap-2">
        <p className="flex h-9 w-9 items-center justify-center rounded-full border">
          {pokemon.generation}
        </p>
        <p>
          <span className="font-semibold">Type:</span>{" "}
          {pokemon.types && pokemon.types.length > 0
            ? pokemon.types.map((t) => t.type?.name ?? "").join(", ")
            : "Unknown"}
        </p>
      </div>
    </div>
  );
}
