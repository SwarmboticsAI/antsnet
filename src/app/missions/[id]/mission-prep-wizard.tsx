"use client";

export enum PrepStep {
  ASSIGN = 0,
  SESSION = 1,
  FINAL = 2,
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RobotGroupAssignmentPanel } from "./robot-group-assignment-panel"; // placeholder
import { MissionDraft } from "@/providers/mission-draft-provider";
import { StartSessionPanel } from "./start-session-panel";
import { FinalValidationPanel } from "./final-validation-panel";

export function MissionPrepWizard({
  mission,
  startMission,
}: {
  mission: MissionDraft;
  startMission: () => void;
}) {
  const [step, setStep] = useState<PrepStep>(PrepStep.ASSIGN);

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  return (
    <div className="space-y-6 fixed top-15 w-96 right-0 bg-sidebar h-[calc(100svh-68px)] overflow-scroll p-4">
      {step === PrepStep.ASSIGN && (
        <section>
          <h2 className="text-lg font-semibold mb-4">1. Assign Robots</h2>
          <RobotGroupAssignmentPanel mission={mission} />
          <Button onClick={handleNext} className="mt-4">
            Continue to Session
          </Button>
        </section>
      )}

      {step === PrepStep.SESSION && (
        <section>
          <h2 className="text-lg font-semibold">
            2. Start Session with Robots
          </h2>
          {/* You could validate robot connectivity or send initial ping */}
          <StartSessionPanel mission={mission} />
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button onClick={handleNext}>Continue to Final Checks</Button>
          </div>
        </section>
      )}

      {step === PrepStep.FINAL && (
        <section>
          <h2 className="text-lg font-semibold">3. Final Checks</h2>
          <FinalValidationPanel />
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button variant="default" onClick={() => startMission()}>
              Start Mission
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
