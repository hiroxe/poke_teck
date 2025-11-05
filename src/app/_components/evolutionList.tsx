import Image from "next/image";
import { useRouter } from "next/navigation";

interface EvolutionItem {
  id?: number | string;
  name: string;
  sprite: string;
}

interface EvolutionListProps {
  title: string;
  pokemons: EvolutionItem[];
}

export function EvolutionList({ title, pokemons }: EvolutionListProps) {
  const router = useRouter();

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <p className="text-md font-semibold">{title}</p>

      <div className="flex flex-row flex-wrap gap-2">
        {pokemons.map((poke) => (
          <Image
            key={poke.name}
            className="cursor-pointer transition hover:scale-110"
            src={poke.sprite}
            alt={poke.name}
            width={50}
            height={50}
            onClick={() => router.push(`/${poke.id ?? poke.name}`)}
          />
        ))}
      </div>
    </div>
  );
}
