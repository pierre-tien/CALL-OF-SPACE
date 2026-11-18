export type HeadsetReport = "unsupported" | "none" | "available";

export async function headsetStatus(): Promise<HeadsetReport> {
  const xr = navigator.xr;
  if (!xr?.isSessionSupported) return "unsupported";
  try {
    const supported = await xr.isSessionSupported("immersive-vr");
    return supported ? "available" : "none";
  } catch {
    return "unsupported";
  }
}
