import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db/connect";
import { MissionModel } from "@/lib/db/schemas/mission";

export async function GET() {
  await connectToDatabase();

  try {
    const missions = await MissionModel.find({}, null, {
      sort: { createdAt: -1 }, // newest first
    });

    return NextResponse.json(missions);
  } catch (err) {
    console.error("❌ Failed to fetch missions:", err);
    return NextResponse.json(
      { error: "Failed to fetch missions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();

  try {
    const mission = await MissionModel.create({
      name: body.name || "Untitled Mission",
      description: body.description || "",
      status: body.status || "DRAFT",
      numberOfRobots: body.numberOfRobots ?? undefined,
      createdAt: new Date(body.createdAt || Date.now()),
      data: body,
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (err) {
    console.error("❌ Failed to save mission:", err);
    return NextResponse.json(
      { error: "Failed to save mission" },
      { status: 500 }
    );
  }
}
