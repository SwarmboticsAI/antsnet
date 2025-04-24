import { NextRequest, NextResponse } from "next/server";
import { MapFeatureModel } from "@/lib/db/schemas/map-feature";
import { connectToDatabase } from "@/lib/db/connect"; // assumes you have a helper like this

export async function GET(req: NextRequest) {
  await connectToDatabase();

  const userId = req.headers.get("x-user-id") || "dev-user"; // replace w/ real auth later

  const features = await MapFeatureModel.find({
    $or: [{ visibility: "public" }, { userId: userId }],
  });

  return NextResponse.json(features);
}

export async function POST(req: NextRequest) {
  await connectToDatabase();

  const userId = req.headers.get("x-user-id") || "dev-user";
  const body = await req.json();

  const newFeature = await MapFeatureModel.create({
    ...body,
    userId,
  });

  return NextResponse.json(newFeature, { status: 201 });
}
