import React from "react";
import { Select } from "./select";
import {
  generationSelectOptions,
  generationTypesOptions,
} from "../constants/types";
import { usePokemonContext } from "~/context/PokemonProvider";

export default function Filter() {
  const {
    setSearchFilter,
    generationFilter,
    typefilter,
    setGenerationFilter,
    setTypeFilter,
  } = usePokemonContext();

  return (
    <div className="flex flex-row gap-2">
      <input
        className="h-10 rounded-sm border border-red-200 p-2 hover:border-red-300 focus:border-red-400 focus:outline-none"
        onChange={(e) => setSearchFilter(e.target.value)}
      />
      <Select
        options={generationSelectOptions}
        multiple
        value={generationFilter}
        onChange={setGenerationFilter}
      />
      <Select
        options={generationTypesOptions}
        multiple
        value={typefilter}
        onChange={setTypeFilter}
      />
    </div>
  );
}
