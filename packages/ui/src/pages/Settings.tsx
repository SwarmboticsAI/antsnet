"use client";

import type React from "react";

import { useState } from "react";
import { Save, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/providers/theme-provider";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function Settings() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  // const { mapMode, callsign, devMode, setMapMode, setCallsign, setDevMode, resetToDefaults } = useSettingsStore()

  // Create local state to track changes before saving
  const [localSettings, setLocalSettings] = useState({
    theme,
  });

  // Handle form changes
  const handleThemeChange = (value: string) => {
    setLocalSettings({
      ...localSettings,
      theme: value as "light" | "dark" | "system",
    });
  };

  const handleMapModeChange = (value: string) => {
    // setLocalSettings({ ...localSettings, mapMode: value as MapMode });
  };

  const handleCallsignChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // setLocalSettings({ ...localSettings, callsign: e.target.value });
  };

  const handleDevModeChange = (checked: boolean) => {
    // setLocalSettings({ ...localSettings, devMode: checked });
  };

  // Save changes
  const saveChanges = () => {
    setTheme(localSettings.theme);
    // setMapMode(localSettings.mapMode);
    // setCallsign(localSettings.callsign);
    // setDevMode(localSettings.devMode);
    toast("Settings saved", {
      description: "Your preferences have been updated.",
    });
  };

  // Cancel changes
  const cancelChanges = () => {
    setLocalSettings({
      theme,
      // mapMode,
      // callsign,
      // devMode,
    });
    navigate(-1);
  };

  // Reset to defaults
  const handleResetToDefaults = () => {
    // resetToDefaults();
    setTheme("system");
    setLocalSettings({
      theme: "system",
      // mapMode: "street",
      // callsign: "",
      // devMode: false,
    });
    toast("Settings reset", {
      description: "All settings have been reset to defaults.",
    });
  };

  return (
    <div className="w-full mx-auto">
      <section className="pt-21 bg-zinc-200 dark:bg-zinc-800 flex flex-col items-center justify-between mb-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
      </section>
      <div className="max-w-5xl mx-auto">
        <Tabs defaultValue="appearance" className="w-full pt-6">
          {/* <TabsList className="grid grid-cols-3 mb-6 w-full">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList> */}

          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>
                  Customize how the application looks and feels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme" className="mb-4">
                    Theme
                  </Label>
                  <RadioGroup
                    id="theme"
                    value={localSettings.theme}
                    onValueChange={handleThemeChange}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light">Light</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark">Dark</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your personal preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="mapMode">Map Mode</Label>
                  <RadioGroup
                    id="mapMode"
                    value={"street"} // Replace with localSettings.mapMode
                    onValueChange={handleMapModeChange}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="satellite" id="satellite" />
                      <Label htmlFor="satellite">Satellite</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="street" id="street" />
                      <Label htmlFor="street">Street View</Label>
                    </div>
                  </RadioGroup>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="callsign">Callsign</Label>
                  <Input
                    id="callsign"
                    value={"callsign"}
                    onChange={handleCallsignChange}
                    placeholder="Enter your callsign"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription>
                  Configure advanced options. Use with caution.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="devMode">Developer Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable additional debugging features
                    </p>
                  </div>
                  <Switch
                    id="devMode"
                    checked={false}
                    onCheckedChange={handleDevModeChange}
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium mb-2">Reset Settings</h3>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleResetToDefaults}
                    className="flex items-center gap-2"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reset to Defaults
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-6">
          {/* <Button variant="outline" onClick={cancelChanges}>
            Cancel
          </Button> */}
          <Button onClick={saveChanges} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
