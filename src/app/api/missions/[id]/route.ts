import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { MissionModel } from "@/lib/db/schemas/mission";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const { id } = await params;

  try {
    const mission = await MissionModel.findById(id);
    if (!mission) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(mission);
  } catch (err) {
    console.error("❌ Failed to load mission:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const updates = await req.json();
  const { id } = await params;

  try {
    const updated = await MissionModel.findByIdAndUpdate(
      id,
      {
        name: updates.name,
        description: updates.description,
        status: updates.status,
        numberOfRobots: updates.numberOfRobots,
        data: updates,
      },
      { new: true }
    );

    return NextResponse.json(updated);
  } catch (err) {
    console.error("❌ Failed to update mission:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectToDatabase();
  const { id } = await params;

  try {
    await MissionModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Failed to delete mission:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
