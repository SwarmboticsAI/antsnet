import { type Request, type Response } from "express";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";

export const registerPayload = async (req: Request, res: Response) => {
  try {
    const { robotId, description, payloadType } = req.body;

    if (!robotId || typeof description !== "string" || !description.trim()) {
      res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
      return;
    }

    const payloadClient = await grpcServiceDirectory.getPayloadClient(robotId);

    payloadClient.registerPayload(
      {
        description,
        type: payloadType,
      },
      (error: any, response: any) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: "Failed to register payload.",
            error: error.message,
          });
        }
        res.status(200).json({
          success: true,
          message: "Payload registered successfully",
          data: response,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to register payload." });
  }
};
