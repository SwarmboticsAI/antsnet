import { useState } from "react";
import { useProfile } from "@/providers/profile-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function ProfileSetup() {
  const { setProfile } = useProfile();
  const [takId, setTakId] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!takId.trim()) {
      setError("TAK ID is required");
      return;
    }

    // Create the profile
    setProfile({
      takId,
      name: name.trim() || undefined,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center w-1/2">
        <Card className="w-md">
          <CardHeader>
            <CardTitle>Welcome to ANTSNet</CardTitle>
            <CardDescription>
              Enter your callsign (TAK ID) to continue.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4 mb-4">
              <div className="space-y-2">
                <label htmlFor="takId" className="text-sm font-medium">
                  TAK ID <span className="text-red-500">*</span>
                </label>
                <Input
                  id="takId"
                  value={takId}
                  onChange={(e) => setTakId(e.target.value)}
                  placeholder="Enter your TAK ID"
                  className="mt-1"
                  required
                />
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full">
                Continue
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      <div className="w-1/2 flex items-center justify-center bg-sidebar h-screen">
        <img
          src="/swarm.png"
          alt="Swarmbotics AI Logo"
          width={300}
          height={300}
          className="rounded-full shadow-lg"
        />
      </div>
    </div>
  );
}
