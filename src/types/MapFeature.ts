import type { Geometry, Feature, FeatureCollection } from "geojson";

export type FeatureType = "polygon" | "border" | "beacon" | "line";
export type Visibility = "public" | "private";

export interface MapFeature {
  _id: string;
  userId: string;
  orgId?: string;
  name: string;
  featureType: FeatureType;
  geometry: Geometry; // this is what you want here
  style?: {
    fillColor?: string;
    strokeColor?: string;
    opacity?: number;
    radius?: number;
    animated?: boolean;
  };
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
}
