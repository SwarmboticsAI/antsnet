import { NextRequest, NextResponse } from "next/server";
import { MapFeatureModel } from "@/lib/db/schemas/map-feature";
import { connectToDatabase } from "@/lib/db/connect";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { id } = await params;

  const feature = await MapFeatureModel.findById(id);

  if (!feature)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(feature);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const updates = await req.json();
  const { id } = await params;

  const updated = await MapFeatureModel.findByIdAndUpdate(id, updates, {
    new: true,
  });

  if (!updated)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();

  const { id } = await params;

  await MapFeatureModel.findByIdAndDelete(id);

  return NextResponse.json({ success: true });
}
