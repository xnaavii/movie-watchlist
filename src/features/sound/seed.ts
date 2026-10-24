import type { MediaType } from "./types";

export type AtmosSeed = {
	title: string;
	year: number;
	mediaType: MediaType;
	/** What to listen for. */
	note: string;
};

/**
 * Hand-picked titles with a Dolby Atmos mix that are known for great sound.
 * Resolved to TMDB ids by title and year the first time the showcase loads.
 * No API exposes Atmos per title, so this list plus community votes is the source.
 */
export const ATMOS_SEED: AtmosSeed[] = [
	{
		title: "Dune",
		year: 2021,
		mediaType: "movie",
		note: "Deep, physical bass from the ornithopters and the sandworm attacks.",
	},
	{
		title: "Dune: Part Two",
		year: 2024,
		mediaType: "movie",
		note: "Sandworm riding and the Harkonnen arena put every channel to work.",
	},
	{
		title: "Top Gun: Maverick",
		year: 2022,
		mediaType: "movie",
		note: "Jets pan across and over the room during the training flights.",
	},
	{
		title: "Mad Max: Fury Road",
		year: 2015,
		mediaType: "movie",
		note: "Relentless engines and the sandstorm chase wrap around you.",
	},
	{
		title: "Blade Runner 2049",
		year: 2017,
		mediaType: "movie",
		note: "Huge, room-shaking synth score and rain overhead.",
	},
	{
		title: "Gravity",
		year: 2013,
		mediaType: "movie",
		note: "Voices and debris move freely around the room.",
	},
	{
		title: "Ford v Ferrari",
		year: 2019,
		mediaType: "movie",
		note: "Engine roar and gear changes at Le Mans.",
	},
	{
		title: "1917",
		year: 2019,
		mediaType: "movie",
		note: "Gunfire, planes and the burning town surround the long takes.",
	},
	{
		title: "A Quiet Place",
		year: 2018,
		mediaType: "movie",
		note: "Silence and tiny sounds test how quiet and precise your system is.",
	},
	{
		title: "Edge of Tomorrow",
		year: 2014,
		mediaType: "movie",
		note: "The beach landing fills the room with dropships and explosions.",
	},
	{
		title: "Ready Player One",
		year: 2018,
		mediaType: "movie",
		note: "The race through the city is a non-stop surround showcase.",
	},
	{
		title: "Avengers: Endgame",
		year: 2019,
		mediaType: "movie",
		note: "The final battle is dense, wide and loud.",
	},
	{
		title: "Avatar: The Way of Water",
		year: 2022,
		mediaType: "movie",
		note: "Underwater scenes and the ocean battle surround you.",
	},
	{
		title: "Baby Driver",
		year: 2017,
		mediaType: "movie",
		note: "Car chases cut to the soundtrack, with precise effects placement.",
	},
	{
		title: "Greyhound",
		year: 2020,
		mediaType: "movie",
		note: "Depth charges and gunfire on the open sea.",
	},
	{
		title: "Godzilla: King of the Monsters",
		year: 2019,
		mediaType: "movie",
		note: "Reference-level bass and overhead monster roars.",
	},
	{
		title: "Godzilla vs. Kong",
		year: 2021,
		mediaType: "movie",
		note: "The Hong Kong fight is a subwoofer workout.",
	},
	{
		title: "The Batman",
		year: 2022,
		mediaType: "movie",
		note: "Rain, the Batmobile chase and a heavy score.",
	},
	{
		title: "John Wick: Chapter 4",
		year: 2023,
		mediaType: "movie",
		note: "Crisp gunfire and the Arc de Triomphe traffic fight.",
	},
	{
		title: "Arrival",
		year: 2016,
		mediaType: "movie",
		note: "Low, eerie sound design that fills the room.",
	},
	{
		title: "Spider-Man: Into the Spider-Verse",
		year: 2018,
		mediaType: "movie",
		note: "Playful, wide mix with lots of movement.",
	},
	{
		title: "Spider-Man: Across the Spider-Verse",
		year: 2023,
		mediaType: "movie",
		note: "Busy, energetic mix with effects all around.",
	},
	{
		title: "Furiosa: A Mad Max Saga",
		year: 2024,
		mediaType: "movie",
		note: "The War Rig ambush is a full surround assault.",
	},
	{
		title: "F1",
		year: 2025,
		mediaType: "movie",
		note: "Cars scream past from every direction.",
	},
	{
		title: "Hacksaw Ridge",
		year: 2016,
		mediaType: "movie",
		note: "Brutal, immersive battle scenes.",
	},
	{
		title: "Mission: Impossible - Fallout",
		year: 2018,
		mediaType: "movie",
		note: "Helicopter chase and HALO jump with lots of overhead action.",
	},
	{
		title: "Ad Astra",
		year: 2019,
		mediaType: "movie",
		note: "Quiet space with sudden, powerful low end.",
	},
	{
		title: "The Creator",
		year: 2023,
		mediaType: "movie",
		note: "Big sci-fi battles and airships passing overhead.",
	},
	{
		title: "Stranger Things",
		year: 2016,
		mediaType: "tv",
		note: "Synth score and creature effects, especially in later seasons.",
	},
	{
		title: "The Mandalorian",
		year: 2019,
		mediaType: "tv",
		note: "Blasters, ships and a deep score in every episode.",
	},
	{
		title: "House of the Dragon",
		year: 2022,
		mediaType: "tv",
		note: "Dragons flying overhead and battle sequences.",
	},
	{
		title: "Foundation",
		year: 2021,
		mediaType: "tv",
		note: "Large-scale sci-fi with sweeping effects.",
	},
	{
		title: "Lost in Space",
		year: 2018,
		mediaType: "tv",
		note: "The crash landing opener is a great system test.",
	},
	{
		title: "The Last of Us",
		year: 2023,
		mediaType: "tv",
		note: "Clickers placed precisely around you in the dark.",
	},
	{
		title: "Andor",
		year: 2022,
		mediaType: "tv",
		note: "Detailed, cinematic mix with big action set pieces.",
	},
	{
		title: "Shōgun",
		year: 2024,
		mediaType: "tv",
		note: "Storms at sea and battles with real weight.",
	},
	{
		title: "Masters of the Air",
		year: 2024,
		mediaType: "tv",
		note: "Bombers, flak and fighters all around the room.",
	},
	{
		title: "See",
		year: 2019,
		mediaType: "tv",
		note: "Built around sound, with very precise placement.",
	},
];

export const toSeedKey = (
	seed: Pick<AtmosSeed, "mediaType" | "title" | "year">,
) => `${seed.mediaType}:${seed.title.toLowerCase()}:${seed.year}`;
