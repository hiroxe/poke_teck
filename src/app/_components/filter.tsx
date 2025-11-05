import React from "react";
import { Select } from "./select";
import { usePokemonContext } from "~/context/PokemonProvider";

export default function Filter() {
  const {
    searchFilter,
    setSearchFilter,
    generationFilter,
    typefilter,
    generations,
    types,
    setGenerationFilter,
    setTypeFilter,
    clearFilters,
  } = usePokemonContext();

  const generationSelectOptions = generations.map((gen) => ({
    label: `Gen ${gen}`,
    value: gen,
  }));

  const typeSelectOptions = types.map((type) => ({
    label: type,
    value: type,
  }));

  return (
    <div className="flex w-full max-w-[900px] flex-col items-center justify-start gap-2 md:flex-row">
      <input
        className="h-10 w-full rounded-sm border border-red-200 p-2 hover:border-red-300 focus:border-red-400 focus:outline-none"
        value={searchFilter ?? ""}
        onChange={(e) => setSearchFilter(e.target.value)}
      />
      <div className="flex w-full flex-row items-center gap-2">
        <Select
          className="w-full"
          options={generationSelectOptions}
          multiple
          value={generationFilter ?? []}
          onChange={setGenerationFilter}
        />
        <Select
          className="w-full capitalize"
          options={typeSelectOptions}
          multiple
          value={typefilter ?? []}
          onChange={setTypeFilter}
        />
      </div>
      <p className="cursor-pointer font-bold" onClick={clearFilters}>
        CLEAR
      </p>
    </div>
  );
}
