import { Schema, model, models } from "mongoose";

const MissionSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ["DRAFT", "READY"], default: "DRAFT" },
    numberOfRobots: { type: Number },
    createdAt: { type: Date, default: Date.now },
    // Save everything else in one big JSON blob for now
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const MissionModel = models.Mission || model("Mission", MissionSchema);
