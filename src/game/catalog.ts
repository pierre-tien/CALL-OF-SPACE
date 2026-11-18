export interface NasaImageAsset {
  id: string;
  title: string;
  file: string;
  credit: string;
  created: string;
  source: string;
  retrievedAt: string;
  gameplay: string;
}

export const IMAGE_RETRIEVED = "2026-11-14";

export const NASA_IMAGES: NasaImageAsset[] = [
  {
    id: "as11-40-5874",
    title: "Apollo 11 Mission image — Astronaut Edwin Aldrin",
    file: "/assets/astronauts/as11-40-5874.jpg",
    credit: "NASA / JSC. Photograph by Neil A. Armstrong, 20 July 1969.",
    created: "1969-07-21",
    source: "https://images.nasa.gov/details/as11-40-5874",
    retrievedAt: IMAGE_RETRIEVED,
    gameplay: "Solo Mode card and the Lunar Exploration card. It does not change flight physics.",
  },
  {
    id: "s130e009953",
    title: "View of Cupola and Earth",
    file: "/assets/spacecraft/s130e009953.jpg",
    credit: "NASA / JSC. STS-130 crew, International Space Station Cupola, 18 February 2010.",
    created: "2010-02-18",
    source: "https://images.nasa.gov/details/s130e009953",
    retrievedAt: IMAGE_RETRIEVED,
    gameplay: "Multiplayer card and the station and rescue mission cards. Visual context only.",
  },
  {
    id: "PIA00122",
    title: "Earth — India and Australia",
    file: "/assets/planets/PIA00122.jpg",
    credit: "NASA / JPL. Galileo spacecraft, 11 December 1990.",
    created: "1990-12-11",
    source: "https://photojournal.jpl.nasa.gov/catalog/PIA00122",
    retrievedAt: IMAGE_RETRIEVED,
    gameplay: "Shown beside the home quote and on the NASA data page. Not a texture on the 3D Earth.",
  },
  {
    id: "PIA00407",
    title: "Global Color Views of Mars",
    file: "/assets/planets/PIA00407.jpg",
    credit: "NASA / JPL / USGS. Viking Orbiter global color mosaic.",
    created: "1998-06-08",
    source: "https://photojournal.jpl.nasa.gov/catalog/PIA00407",
    retrievedAt: IMAGE_RETRIEVED,
    gameplay: "Mars Exploration card. The Mars flight model still uses gameplay propellant and thrust.",
  },
];

export const MISSION_IMAGE: Partial<Record<"lunar" | "mars" | "station" | "asteroid" | "rescue", string>> = {
  lunar: "/assets/astronauts/as11-40-5874.jpg",
  mars: "/assets/planets/PIA00407.jpg",
  station: "/assets/spacecraft/s130e009953.jpg",
  rescue: "/assets/spacecraft/s130e009953.jpg",
};

export const SBDB_2012_TC4 = {
  fullName: "(2012 TC4)",
  designation: "2012 TC4",
  orbitClass: "Apollo",
  neo: true,
  pha: false,
  semiMajorAxisAu: 1.62,
  eccentricity: 0.404,
  perihelionAu: 0.966,
  periodDays: 753,
  absoluteMagnitude: 26.71,
  rotationHours: 0.204155,
  solutionDate: "2026-07-28 09:30:39",
  source: "NASA/JPL Small-Body Database API",
  sourceUrl: "https://ssd-api.jpl.nasa.gov/sbdb.api?sstr=2012%20TC4&phys-par=1",
  retrievedAt: "2026-11-14T21:52:00Z",
  gameplay: "Shown on the asteroid briefing and the NASA data page. It does not replace the game's propellant budget.",
};
