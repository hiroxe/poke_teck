export const pokemonTypes = [
  {
    name: "normal",
    image: "",
  },
  {
    name: "fighting",
    image: "",
  },
  {
    name: "flying",
    image: "",
  },
  {
    name: "poison",
    image: "",
  },
  {
    name: "ground",
    image: "",
  },
  {
    name: "rock",
    image: "",
  },
  {
    name: "bug",
    image: "",
  },
  {
    name: "ghost",
    image: "",
  },
  {
    name: "steel",
    image: "",
  },
  {
    name: "fire",
    image: "",
  },
  {
    name: "water",
    image: "",
  },
  {
    name: "grass",
    image: "",
  },
  {
    name: "electric",
    image: "",
  },
  {
    name: "psychic",
    image: "",
  },
  {
    name: "ice",
    image: "",
  },
  {
    name: "dragon",
    image: "",
  },
  {
    name: "dark",
    image: "",
  },
  {
    name: "fairy",
    image: "",
  },
  {
    name: "stellar",
    image: "",
  },
];

export const generationTypesOptions = pokemonTypes.map((type) => ({
  label: type.name.charAt(0).toUpperCase() + type.name.slice(1),
  value: type.name,
}));

export enum PokemonGeneration {
  GENERATION_I = "I",
  GENERATION_II = "II",
  GENERATION_III = "III",
  GENERATION_IV = "IV",
  GENERATION_V = "V",
  GENERATION_VI = "VI",
  GENERATION_VII = "VII",
  GENERATION_VIII = "VIII",
  GENERATION_IX = "IX",
}

export const generationSelectOptions = Object.values(PokemonGeneration).map(
  (gen) => ({
    label: `Gen ${gen}`,
    value: gen,
  }),
);
