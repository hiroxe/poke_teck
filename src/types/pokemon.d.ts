import type { Pokemon } from "pokenode-ts";

export interface IPokemon extends Pokemon {
  generation: string;
  preevolutions: string[];
  evolutions: string[];
  evolutionChainUrl: string;
  evolutionChainNames: string[];
}

export interface EvolutionUrlChain {
  url: string;
  names: string[];
}
