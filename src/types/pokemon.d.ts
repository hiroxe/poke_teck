import type { Pokemon, Type } from "pokenode-ts";

export interface IPokemon extends Pokemon {
  generation: string;
  preevolutions: string[];
  evolutions: string[];
  evolutionChainUrl: string;
  evolutionChainNames: string[];
}

export interface IPokemonType {
  name: string;
  sprite: string;
}

export interface IPokemonList {
  id: number;
  name: string;
  url: string;
  generation: string;
  types: IPokemonType[];
  evolutionChainNames: string[];
}

export interface EvolutionUrlChain {
  url: string;
  names: string[];
}

export interface IType extends Type {
  sprites?: { "generation-viii": { "sword-shield": { name_icon: string } } };
}
