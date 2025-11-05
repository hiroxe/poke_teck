import { describe, it, expect } from "@jest/globals";
import type { ChainLink } from "pokenode-ts";
import { getSpeciesLines } from "./evolution";

describe("evolution helpers (pure logic)", () => {
  it("getSpeciesLines returns all possible evolution paths (branched chain)", () => {
    const chain: ChainLink = {
      species: { name: "pichu", url: "" },
      is_baby: true,
      evolution_details: [],
      evolves_to: [
        {
          species: { name: "pikachu", url: "" },
          is_baby: false,
          evolution_details: [],
          evolves_to: [
            {
              species: { name: "raichu", url: "" },
              evolves_to: [],
              is_baby: false,
              evolution_details: [],
            },
            {
              species: { name: "raichu-alola", url: "" },
              evolves_to: [],
              is_baby: false,
              evolution_details: [],
            },
          ],
        },
      ],
    };

    const result = getSpeciesLines(chain);

    const expected = [
      ["pichu", "pikachu", "raichu"],
      ["pichu", "pikachu", "raichu-alola"],
    ];

    const normalize = (arr: string[][]) =>
      arr
        .map((path) =>
          path.map((n) => String(n).trim().toLowerCase()).join("|"),
        )
        .sort();

    expect(normalize(result)).toEqual(normalize(expected));
  });
});
