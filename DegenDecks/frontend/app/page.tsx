'use client';

import { Games } from "@/components/Games";
import { Hero } from "@/components/Hero";
import { useAppContext } from "@/providers/AppProvider";

export default function Home() {
  const { games, connected } = useAppContext();

  return (
    <div className="flex-1">
      <Hero/>
      <Games games={games} connected={connected}/>
    </div>
  );
}
