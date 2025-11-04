import React from "react";
import { Select } from "./select";
import {
  generationSelectOptions,
  generationTypesOptions,
} from "../constants/types";
import { usePokemonContext } from "~/context/PokemonProvider";

export default function Filter() {
  const {
    searchFilter,
    setSearchFilter,
    generationFilter,
    typefilter,
    setGenerationFilter,
    setTypeFilter,
  } = usePokemonContext();

  return (
    <div className="flex w-full max-w-[900px] flex-row justify-start gap-2">
      <input
        className="h-10 w-full rounded-sm border border-red-200 p-2 hover:border-red-300 focus:border-red-400 focus:outline-none"
        value={searchFilter ?? ""}
        onChange={(e) => setSearchFilter(e.target.value)}
      />
      <Select
        className="w-full"
        options={generationSelectOptions}
        multiple
        value={generationFilter ?? []}
        onChange={setGenerationFilter}
      />
      <Select
        className="w-full"
        options={generationTypesOptions}
        multiple
        value={typefilter ?? []}
        onChange={setTypeFilter}
      />
    </div>
  );
}
