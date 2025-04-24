import { MapFeature } from "@/types/MapFeature";

export async function fetchMapFeatures(): Promise<MapFeature[]> {
  const res = await fetch("/api/map-features");
  if (!res.ok) throw new Error("Failed to fetch map features");
  return res.json();
}

export async function createMapFeature(
  input: Partial<MapFeature>
): Promise<MapFeature> {
  const res = await fetch("/api/map-features", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error("Failed to create feature");
  return res.json();
}

export async function updateMapFeature(
  id: string,
  updates: Partial<MapFeature>
): Promise<MapFeature> {
  const res = await fetch(`/api/map-features/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update feature");
  return res.json();
}

export async function deleteMapFeature(id: string): Promise<void> {
  const res = await fetch(`/api/map-features/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete feature");
}
