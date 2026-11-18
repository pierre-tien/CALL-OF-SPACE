export interface NasaSnapshot {
  status: "loading" | "live" | "cache";
  retrievedAt: string;
  moonRangeKm: number;
  moonRadiusKm: number;
  moonGravity: number;
  marsRangeKm: number;
  asteroidName: string;
  asteroidModified: string;
  vinfDepartureKmS: number;
  vinfArrivalKmS: number;
  tofDays: number;
  message?: string;
}

interface CacheFile {
  retrievedAt: string;
  moon: { rangeKm: number; radiusKm: number; surfaceGravityMs2: number };
  mars: { rangeKm: number };
  asteroid: {
    fullName: string;
    catalogModified: string;
    sample: { vinfDepartureKmS: number; vinfArrivalKmS: number; timeOfFlightDays: number };
  };
}

function fromCache(cache: CacheFile, status: NasaSnapshot["status"]): NasaSnapshot {
  return {
    status,
    retrievedAt: cache.retrievedAt,
    moonRangeKm: cache.moon.rangeKm,
    moonRadiusKm: cache.moon.radiusKm,
    moonGravity: cache.moon.surfaceGravityMs2,
    marsRangeKm: cache.mars.rangeKm,
    asteroidName: cache.asteroid.fullName,
    asteroidModified: cache.asteroid.catalogModified,
    vinfDepartureKmS: cache.asteroid.sample.vinfDepartureKmS,
    vinfArrivalKmS: cache.asteroid.sample.vinfArrivalKmS,
    tofDays: cache.asteroid.sample.timeOfFlightDays,
  };
}

function rangeFromHorizons(result: string): number | null {
  const match = result.match(/RG\s*=\s*([0-9.E+-]+)/i);
  return match ? Number(match[1]) : null;
}

async function horizonsRange(command: string): Promise<number | null> {
  const params = new URLSearchParams({
    format: "json",
    COMMAND: `'${command}'`,
    OBJ_DATA: "NO",
    MAKE_EPHEM: "YES",
    EPHEM_TYPE: "VECTORS",
    CENTER: "'500@399'",
    START_TIME: "'2026-11-14'",
    STOP_TIME: "'2026-11-15'",
    STEP_SIZE: "'1 d'",
  });
  const response = await fetch(`/api/horizons?${params.toString()}`);
  if (!response.ok) return null;
  const body = (await response.json()) as { result?: string };
  return body.result ? rangeFromHorizons(body.result) : null;
}

export async function loadNasa(): Promise<NasaSnapshot> {
  const cacheResponse = await fetch("/data/nasa-cache.json");
  const cache = (await cacheResponse.json()) as CacheFile;
  try {
    const [moon, mars] = await Promise.all([horizonsRange("301"), horizonsRange("499")]);
    if (!moon || !mars) return fromCache(cache, "cache");
    const snapshot = fromCache(cache, "live");
    snapshot.moonRangeKm = moon;
    snapshot.marsRangeKm = mars;
    snapshot.retrievedAt = new Date().toISOString();
    return snapshot;
  } catch {
    return fromCache(cache, "cache");
  }
}

export function formatKm(km: number, locale: string): string {
  return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(km)} km`;
}
