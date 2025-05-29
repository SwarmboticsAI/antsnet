import { type Request, type Response } from "express";
import { grpcServiceDirectory } from "@/services/grpc/grpc-service-directory";

export const triggerBoom = (req: Request, res: Response) => {
  try {
    const { robotId, shouldEngageButtonCommand } = req.body;

    if (!robotId || typeof shouldEngageButtonCommand !== "boolean") {
      res.status(400).json({
        success: false,
        message: "Missing required parameters",
      });
      return;
    }

    const payloadClient = grpcServiceDirectory.getPayloadClient(robotId);

    payloadClient.triggerBoom(
      {
        shouldEngageButtonCommand,
      },
      (error: any, response: any) => {
        if (error) {
          return res.status(500).json({
            success: false,
            message: "Failed to trigger boom.",
            error: error.message,
          });
        }
        res.status(200).json({
          success: true,
          message: "Boom triggered successfully",
          data: response,
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: "Failed to send boom." });
  }
};
