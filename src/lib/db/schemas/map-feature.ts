import { Schema, model, models } from "mongoose";

const MapFeatureSchema = new Schema(
  {
    userId: { type: String, required: true },
    orgId: { type: String, required: false },
    name: { type: String, required: true },
    featureType: {
      type: String,
      enum: ["polygon", "border", "beacon", "line"],
      required: true,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point", "LineString", "Polygon"],
        required: true,
      },
      coordinates: { type: [Schema.Types.Mixed], required: true },
    },
    style: {
      fillColor: { type: String },
      strokeColor: { type: String },
      opacity: { type: Number },
      radius: { type: Number },
      animated: { type: Boolean },
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
  },
  { timestamps: true }
);

export const MapFeatureModel =
  models.MapFeature || model("MapFeature", MapFeatureSchema);
