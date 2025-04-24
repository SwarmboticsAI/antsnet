"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  MissionDraft,
  useMissionDraft,
} from "@/providers/mission-draft-provider";
import { useGeoDrawing } from "@/providers/geo-drawing-provider";
import {
  behaviorConfigMap as behaviorConfigMapImport,
  SupportedBehavior,
} from "@/utils/behavior-config-map";
import { Behavior } from "@/protos/generated/sbai_behavior_protos/sbai_behavior_protos/behavior_request";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Save,
  User,
  Users,
  Clock,
  Check,
  ArrowRight,
  Flag,
  Target,
  ChevronDown,
  ChevronUp,
  X,
  Command,
  CheckCircle2,
  Loader,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { MapInteractionMode } from "@/providers/map-provider";

// Consistent vibrant color from string using HSL
const stringToColor = (str: string) => {
  let hash = 0;

  // Simple hash function (fnv-1a-like)
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }

  // Map hash to HSL
  const hue = hash % 360;
  const saturation = 70; // percent
  const lightness = 50; // percent

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export const MissionBuilder = () => {
  const { state, dispatch } = useMissionDraft();

  // Move this from inside handlers to component top level
  const {
    startDrawing,
    resetDrawing,
    state: geoDrawState,
    setMetadata,
  } = useGeoDrawing();

  // States
  const [expanded, setExpanded] = useState(true);
  const [missionName, setMissionName] = useState(
    state.mission.name || "New Mission"
  );
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupSize, setNewGroupSize] = useState<number>(1);
  const [stagingName, setStagingName] = useState("");
  const [newPhase, setNewPhase] = useState("");
  const [activePhaseId, setActivePhaseId] = useState<string | null>(null);
  const [behaviorType, setBehaviorType] = useState<SupportedBehavior>(
    Behavior.BEHAVIOR_RALLY
  );
  const [params, setParams] = useState<any>(
    behaviorConfigMapImport[Behavior.BEHAVIOR_RALLY].getDefaultParams()
  );
  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [editingBehaviorId, setEditingBehaviorId] = useState<string | null>(
    null
  );
  const [delayMs, setDelayMs] = useState<number | undefined>();
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [skippable, setSkippable] = useState(false);

  // UI states
  const [setupTab, setSetupTab] = useState<string>("phases");
  const [isDrawingMode, setIsDrawingMode] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isAddingBehavior, setIsAddingBehavior] = useState(false);
  const [drawingForStagingArea, setDrawingForStagingArea] = useState(false);
  const [drawingForBehavior, setDrawingForBehavior] = useState(false);

  // Refs
  const activePhaseRef = useRef<HTMLDivElement>(null);
  const behaviorConfigRef = useRef<HTMLDivElement>(null);

  // Define the behavior config map outside of handlers
  const behaviorConfigMap = useMemo(
    () => ({
      [Behavior.BEHAVIOR_RALLY]: {
        interactionMode: MapInteractionMode.DRAWING_POINTS,
        ...behaviorConfigMapImport[Behavior.BEHAVIOR_RALLY],
      },
      [Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION]: {
        interactionMode: MapInteractionMode.DRAWING_POINTS,
        ...behaviorConfigMapImport[Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION],
      },
    }),
    []
  );

  // Move these handlers to be properly defined with useCallback
  const cancelDrawing = useCallback(() => {
    setIsDrawingMode(false);
    setDrawingForStagingArea(false);
    setDrawingForBehavior(false);
    resetDrawing();
  }, [resetDrawing]);

  const handleStartDrawingStagingArea = useCallback(() => {
    if (stagingName.trim() === "") return;

    setDrawingForStagingArea(true);

    startDrawing("polygon", MapInteractionMode.DRAWING_POLYGON, {
      stagingAreaName: stagingName,
    });
  }, [stagingName, startDrawing]);

  const handleStartDrawingForBehavior = useCallback(() => {
    const config =
      behaviorConfigMap[behaviorType as keyof typeof behaviorConfigMap];
    if (!config) return;

    setDrawingForBehavior(true);

    if ("geometryType" in config && config.geometryType) {
      startDrawing(config.geometryType, config.interactionMode, {
        behaviorType: behaviorType,
        params: params,
      });
    } else {
      if ("geometryType" in config) {
        console.error("Invalid geometryType:", config.geometryType);
      } else {
        console.error("geometryType is not defined in the config.");
      }
    }
  }, [behaviorType, behaviorConfigMap, startDrawing, params]);

  const handleAddStagingArea = useCallback(() => {
    if (!stagingName.trim() || geoDrawState.geoPoints.length < 3) return;

    dispatch({
      type: "ADD_STAGING_AREA",
      area: {
        name: stagingName,
        geoPolygon: geoDrawState.geoPoints,
      },
    });

    setStagingName("");
    resetDrawing();
  }, [stagingName, geoDrawState.geoPoints, dispatch, resetDrawing]);

  // Handle drawing state
  useEffect(() => {
    if (geoDrawState.mode === "drawing") {
      setMetadata({ behaviorType, params });
      setIsDrawingMode(true);
    } else if (geoDrawState.mode === "idle" && isDrawingMode) {
      // We've exited drawing mode

      // Only show success message if we actually completed drawing something
      if (geoDrawState.geoPoints.length > 0) {
        setShowSuccessMessage(true);

        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 1500);

        if (drawingForStagingArea) {
          setSetupTab("staging");
        }
      }

      // Always clear drawing state flags
      setIsDrawingMode(false);
      setDrawingForStagingArea(false);
      setDrawingForBehavior(false);
    }
  }, [
    geoDrawState.mode,
    geoDrawState.geoPoints.length,
    setMetadata,
    isDrawingMode,
    drawingForStagingArea,
    drawingForBehavior,
    behaviorType,
    params,
  ]);

  useEffect(() => {
    dispatch({ type: "SET_NAME", name: missionName });
  }, [missionName, dispatch]);

  useEffect(() => {
    if (activePhaseId && activePhaseRef.current) {
      activePhaseRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activePhaseId]);

  useEffect(() => {
    if (isAddingBehavior && behaviorConfigRef.current) {
      behaviorConfigRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isAddingBehavior]);

  // Group functions
  const handleAddGroup = useCallback(() => {
    if (!newGroupName.trim() || newGroupSize <= 0) return;
    dispatch({
      type: "ADD_GROUP",
      group: {
        name: newGroupName,
        size: newGroupSize,
      },
    });
    setNewGroupName("");
    setNewGroupSize(1);
  }, [newGroupName, newGroupSize, dispatch]);

  const handleDeleteGroup = useCallback(
    (groupId: string) => {
      dispatch({ type: "REMOVE_GROUP", groupId });
    },
    [dispatch]
  );

  // Phase functions
  const handleAddPhase = useCallback(() => {
    if (!newPhase.trim()) return;
    const phaseId = dispatch({ type: "ADD_PHASE", name: newPhase });
    setNewPhase("");
    setSetupTab("phases");
  }, [newPhase, dispatch]);

  const handleMovePhase = useCallback(
    (phaseId: string, direction: "up" | "down") => {
      const phases = [...state.mission.phases];
      const index = phases.findIndex((p) => p.id === phaseId);
      if (index === -1) return;
      // Phase movement logic would go here
    },
    [state.mission.phases]
  );

  // Behavior functions
  const handleAddBehaviorToPhase = useCallback((phaseId: string) => {
    setActivePhaseId(phaseId);
    setEditingBehaviorId(null);
    resetBehaviorForm();
    setIsAddingBehavior(true);
  }, []);

  const resetBehaviorForm = useCallback(() => {
    setParams(
      behaviorConfigMapImport[Behavior.BEHAVIOR_RALLY].getDefaultParams()
    );
    setGroupIds([]);
    setDelayMs(undefined);
    setRequiresApproval(false);
    setSkippable(false);
    setEditingBehaviorId(null);
    resetDrawing();
  }, [resetDrawing]);

  const handleEditBehavior = useCallback(
    (behaviorId: string, phaseId: string) => {
      const phase = state.mission.phases.find((p) => p.id === phaseId);
      const b = phase?.behaviors.find((b) => b.id === behaviorId);
      if (!b) return;

      setActivePhaseId(phaseId);
      setEditingBehaviorId(behaviorId);
      setBehaviorType(b.behaviorType as SupportedBehavior);
      setParams(b.params);
      setGroupIds(b.groupIds ?? []);
      setDelayMs(b.delayMs);
      setRequiresApproval(!!b.requiresApproval);
      setSkippable(!!b.skippable);
      setIsAddingBehavior(true);
    },
    [state.mission.phases]
  );

  const handleSaveBehavior = useCallback(() => {
    if (!activePhaseId) return;
    const geo = geoDrawState.geoPoints.length ? geoDrawState.geoPoints : [];

    const newBehavior = {
      behaviorType,
      groupIds,
      params: { ...params, geoPoints: geo },
      delayMs,
      requiresApproval,
      skippable,
    };

    if (editingBehaviorId) {
      dispatch({
        type: "UPDATE_BEHAVIOR",
        behaviorId: editingBehaviorId,
        update: newBehavior,
      });
    } else {
      dispatch({
        type: "ADD_BEHAVIOR",
        phaseId: activePhaseId,
        behavior: newBehavior,
      });
    }

    setIsAddingBehavior(false);
    resetBehaviorForm();
  }, [
    activePhaseId,
    geoDrawState.geoPoints,
    behaviorType,
    groupIds,
    params,
    delayMs,
    requiresApproval,
    skippable,
    editingBehaviorId,
    dispatch,
    resetBehaviorForm,
  ]);

  const handleCancelAddBehavior = useCallback(() => {
    setIsAddingBehavior(false);
    resetBehaviorForm();
  }, [resetBehaviorForm]);

  const handleDeleteBehavior = useCallback(
    (behaviorId: string) => {
      dispatch({ type: "REMOVE_BEHAVIOR", behaviorId });
      if (editingBehaviorId === behaviorId) {
        resetBehaviorForm();
        setIsAddingBehavior(false);
      }
    },
    [dispatch, editingBehaviorId, resetBehaviorForm]
  );

  const handleMoveBehavior = useCallback(
    (behaviorId: string, phaseId: string, direction: "up" | "down") => {
      const phase = state.mission.phases.find((p) => p.id === phaseId);
      if (!phase) return;

      const behaviors = [...phase.behaviors];
      const index = behaviors.findIndex((b) => b.id === behaviorId);
      if (index === -1) return;
      // Behavior movement logic would go here
    },
    [state.mission.phases]
  );

  const handleSaveMission = useCallback(async () => {
    const missionRecord: MissionDraft = {
      ...state.mission,
      status: "READY",
    };

    try {
      const res = await fetch("/api/missions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(missionRecord),
      });

      if (!res.ok) throw new Error("Request failed");

      const saved = await res.json();
      console.log("✅ Mission saved:", saved);
      alert("Mission saved successfully!");
    } catch (err) {
      console.error("❌ Error saving mission:", err);
      alert("Error saving mission");
    }
  }, [state.mission]);

  // Helper functions
  const getGroupNames = useCallback(
    (ids: string[]) => {
      return ids
        .map((id) => {
          const group = state.mission.robotGroups.find((g) => g.id === id);
          return group ? group.name : "Unknown";
        })
        .join(", ");
    },
    [state.mission.robotGroups]
  );

  const getBehaviorIcon = useCallback((type: SupportedBehavior) => {
    switch (type) {
      case Behavior.BEHAVIOR_RALLY:
        return <Flag className="w-4 h-4" />;
      case Behavior.BEHAVIOR_PATROL:
        return <ArrowRight className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  }, []);

  return (
    <>
      <div
        className={`fixed top-15 right-0 h-[calc(100vh-60px)] overflow-y-scroll bg-sidebar z-10 border-l shadow-md transition-all duration-300 ${
          expanded ? "w-130" : "w-14"
        }`}
      >
        {/* Collapsed View */}
        {!expanded && (
          <div className="flex flex-col items-center py-4 space-y-4">
            <Command
              className="w-6 h-6"
              onClick={() => {
                setExpanded(true);
              }}
            />
            <Separator className="w-8" />
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setExpanded(true);
                  setSetupTab("groups");
                }}
              >
                <Users className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setExpanded(true);
                  setSetupTab("staging");
                }}
              >
                <MapPin className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setExpanded(true);
                  setSetupTab("phases");
                }}
              >
                <Clock className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}

        {/* Expanded View */}
        {expanded && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-background sticky top-0 z-10">
              <div className="flex items-center">
                <Command
                  className="w-5 h-5 mr-2"
                  onClick={() => {
                    setExpanded(false);
                  }}
                />
                <div>
                  <Input
                    value={missionName}
                    onChange={(e) => setMissionName(e.target.value)}
                    className="h-6 p-1 text-base font-bold focus-visible:ring-0 border-0 focus-visible:border-0 bg-transparent"
                  />
                  <p className="text-xs text-muted-foreground">
                    Mission Planner
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={handleSaveMission}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>

            {/* Setup Tabs */}
            <Tabs
              value={setupTab}
              onValueChange={setSetupTab}
              className="flex-1 flex flex-col px-4"
            >
              <TabsList className="grid grid-cols-3 mt-2 w-full rounded-sm">
                <TabsTrigger value="groups" className="text-xs rounded-sm">
                  <Users className="w-3 h-3 mr-1" /> Swarms (
                  {state.mission.robotGroups.length})
                </TabsTrigger>
                <TabsTrigger value="staging" className="text-xs rounded-sm">
                  <MapPin className="w-3 h-3 mr-1" /> Assembly (
                  {state.mission.stagingAreas.length})
                </TabsTrigger>
                <TabsTrigger value="phases" className="text-xs rounded-sm">
                  <Clock className="w-3 h-3 mr-1" /> Stages
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 pb-8 h-full overflow-auto">
                {/* Robot Groups Tab */}
                <TabsContent value="groups" className="pt-4 space-y-4">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Group Name"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Size"
                      value={newGroupSize}
                      onChange={(e) => setNewGroupSize(Number(e.target.value))}
                      className="w-24"
                    />
                    <Button onClick={handleAddGroup}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 mt-4">
                    {state.mission.robotGroups.map((group) => (
                      <div
                        key={group.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                        style={{
                          borderLeftColor: stringToColor(group.name),
                          borderLeftWidth: "4px",
                        }}
                      >
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-2" />
                          <span className="font-medium">{group.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {group.size} {group.size === 1 ? "robot" : "robots"}
                          </Badge>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteGroup(group.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {state.mission.robotGroups.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No swarm groups defined</p>
                      <p className="text-sm">Add groups to assign behaviors</p>
                    </div>
                  )}

                  {state.mission.robotGroups.length > 0 && (
                    <div className="text-center mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setSetupTab("phases")}
                      >
                        Continue to Mission Flow
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Staging Areas Tab */}
                <TabsContent value="staging" className="pt-4 space-y-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Staging Area Name"
                      value={stagingName}
                      onChange={(e) => setStagingName(e.target.value)}
                    />

                    <div className="flex space-x-2">
                      <Button
                        onClick={handleStartDrawingStagingArea}
                        variant={
                          geoDrawState.geoPoints.length > 0
                            ? "secondary"
                            : "outline"
                        }
                        className="flex-1"
                        disabled={!stagingName.trim()}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        {geoDrawState.geoPoints.length > 0
                          ? "Area Selected"
                          : "Draw Area on Map"}
                      </Button>
                      <Button
                        onClick={handleAddStagingArea}
                        disabled={
                          !stagingName.trim() ||
                          geoDrawState.geoPoints.length < 3
                        }
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 mt-4">
                    {state.mission.stagingAreas.map((area) => (
                      <div
                        key={area.id}
                        className="flex items-center justify-between p-2 border rounded-md"
                      >
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{area.name}</span>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            /* TODO: Delete area */
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {state.mission.stagingAreas.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      <MapPin className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>No staging areas defined</p>
                      <p className="text-sm">
                        Draw areas on the map to stage your robots
                      </p>
                    </div>
                  )}

                  {state.mission.stagingAreas.length > 0 && (
                    <div className="text-center mt-6">
                      <Button
                        variant="outline"
                        onClick={() => setSetupTab("phases")}
                      >
                        Continue to Mission Flow
                      </Button>
                    </div>
                  )}
                </TabsContent>

                {/* Phases Tab */}
                <TabsContent value="phases" className="pt-4 space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      Mission Flow
                    </h2>
                    <div className="flex space-x-2">
                      <Input
                        placeholder="New Phase"
                        value={newPhase}
                        onChange={(e) => setNewPhase(e.target.value)}
                        className="h-8 text-sm w-40"
                      />
                      <Button size="sm" onClick={handleAddPhase}>
                        <Plus className="w-3 h-3 mr-1" /> Add
                      </Button>
                    </div>
                  </div>

                  {/* Check if we're adding a behavior first */}
                  {isAddingBehavior && activePhaseId && (
                    <div
                      ref={behaviorConfigRef}
                      className="border rounded-md p-4 space-y-4 bg-muted/30 mb-6"
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          {editingBehaviorId
                            ? "Edit Behavior"
                            : "Add Behavior to"}
                          <span className="ml-1 text-primary">
                            {
                              state.mission.phases.find(
                                (p) => p.id === activePhaseId
                              )?.name
                            }
                          </span>
                        </h3>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={handleCancelAddBehavior}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Behavior Type */}
                      <div className="space-y-2">
                        <Label className="text-xs">Behavior Type</Label>
                        <Select
                          value={behaviorType.toString()}
                          onValueChange={(val) => {
                            const selected = Number(val) as SupportedBehavior;
                            setBehaviorType(selected);
                            setParams(
                              behaviorConfigMapImport[
                                selected
                              ].getDefaultParams()
                            );
                            resetDrawing();
                          }}
                        >
                          <SelectTrigger className="h-8 text-sm">
                            <SelectValue placeholder="Select behavior" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(behaviorConfigMap).map(
                              ([value, config]) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex items-center">
                                    {getBehaviorIcon(
                                      Number(value) as SupportedBehavior
                                    )}
                                    <span className="ml-2">{config.label}</span>
                                  </div>
                                </SelectItem>
                              )
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Select Groups */}
                      <div className="space-y-2">
                        <Label className="text-xs">Robot Groups</Label>
                        {state.mission.robotGroups.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            {state.mission.robotGroups.map((g) => (
                              <div
                                key={g.id}
                                className={`
                                flex items-center justify-between p-1 rounded-md border text-sm
                                cursor-pointer
                                ${
                                  groupIds.includes(g.id)
                                    ? "bg-primary/10 border-primary"
                                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                                }
                              `}
                                style={
                                  groupIds.includes(g.id)
                                    ? {
                                        borderLeftColor: stringToColor(g.name),
                                        borderLeftWidth: "4px",
                                      }
                                    : undefined
                                }
                                onClick={() =>
                                  setGroupIds((prev) =>
                                    prev.includes(g.id)
                                      ? prev.filter((id) => id !== g.id)
                                      : [...prev, g.id]
                                  )
                                }
                              >
                                <div className="flex items-center truncate pr-2">
                                  <User className="w-3 h-3 mr-1 flex-shrink-0" />
                                  <span className="truncate">{g.name}</span>
                                </div>
                                <Checkbox
                                  checked={groupIds.includes(g.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setGroupIds((prev) => [...prev, g.id]);
                                    } else {
                                      setGroupIds((prev) =>
                                        prev.filter((id) => id !== g.id)
                                      );
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-3 w-3"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-2 text-muted-foreground text-xs">
                            <p>No swarm groups available</p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-1"
                              onClick={() => setSetupTab("groups")}
                            >
                              <Plus className="w-3 h-3 mr-1" /> Add Groups
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Geo Positioning */}
                      <Button
                        variant={
                          geoDrawState.geoPoints.length
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                        onClick={handleStartDrawingForBehavior}
                        className="w-full"
                      >
                        <MapPin className="h-4 w-4 mr-2" />
                        {geoDrawState.geoPoints.length
                          ? "Position Selected"
                          : "Set Position on Map"}
                      </Button>

                      {/* Behavior-specific parameters */}
                      {behaviorType in behaviorConfigMap &&
                        behaviorType in behaviorConfigMap &&
                        behaviorConfigMap[
                          behaviorType as keyof typeof behaviorConfigMap
                        ]?.ParamForm &&
                        (() => {
                          const ParamForm =
                            behaviorConfigMap[
                              behaviorType as keyof typeof behaviorConfigMap
                            ]?.ParamForm;
                          return (
                            <div className="bg-muted/50 p-3 rounded-md">
                              <h4 className="text-xs font-medium mb-2">
                                Parameters
                              </h4>
                              {ParamForm && (
                                <ParamForm
                                  params={params}
                                  onChange={setParams}
                                />
                              )}
                            </div>
                          );
                        })()}

                      {/* Advanced Settings */}
                      <Collapsible className="w-full">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-medium">
                            Advanced Settings
                          </h4>
                          <CollapsibleTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 text-xs"
                            >
                              <ChevronDown className="h-3 w-3 ml-1" />
                            </Button>
                          </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="space-y-3 pt-2">
                          <div className="space-y-1">
                            <Label htmlFor="delay" className="text-xs">
                              Delay (ms)
                            </Label>
                            <Input
                              id="delay"
                              type="number"
                              placeholder="Delay before execution"
                              value={delayMs ?? ""}
                              onChange={(e) =>
                                setDelayMs(Number(e.target.value) || undefined)
                              }
                              className="h-7 text-sm"
                            />
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="approval"
                              checked={requiresApproval}
                              onCheckedChange={(val) =>
                                setRequiresApproval(!!val)
                              }
                              className="h-3 w-3"
                            />
                            <Label htmlFor="approval" className="text-xs">
                              Requires Approval
                            </Label>
                          </div>

                          <div className="flex items-center gap-2">
                            <Checkbox
                              id="skippable"
                              checked={skippable}
                              onCheckedChange={(val) => setSkippable(!!val)}
                              className="h-3 w-3"
                            />
                            <Label htmlFor="skippable" className="text-xs">
                              Skippable
                            </Label>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>

                      <div className="flex justify-end space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCancelAddBehavior}
                        >
                          Cancel
                        </Button>
                        <Button size="sm" onClick={handleSaveBehavior}>
                          {editingBehaviorId ? "Update" : "Add"} Behavior
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="relative space-y-6 pl-6">
                    {/* Vertical line for timeline */}
                    <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border" />

                    {state.mission.phases.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-12 h-12 mx-auto mb-2 opacity-30" />
                        <p>Add phases to build your mission flow</p>
                        {state.mission.robotGroups.length === 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-4"
                            onClick={() => setSetupTab("groups")}
                          >
                            <Users className="w-3 h-3 mr-1" /> Set Up Robot
                            Groups First
                          </Button>
                        )}
                      </div>
                    ) : (
                      state.mission.phases.map((phase, idx) => (
                        <div
                          key={phase.id}
                          ref={
                            activePhaseId === phase.id ? activePhaseRef : null
                          }
                          className={`relative ${
                            activePhaseId === phase.id && !isAddingBehavior
                              ? "border-primary"
                              : ""
                          }`}
                        >
                          {/* Timeline node */}
                          <div className="absolute left-[-1.5rem] flex items-center justify-center w-6 h-6 bg-background rounded-full border-2 border-primary z-10">
                            {idx + 1}
                          </div>

                          <div className="mb-1 ml-2 flex items-center justify-between">
                            <h3 className="text-base font-medium">
                              {phase.name}
                            </h3>
                            <div className="flex space-x-1">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() => handleMovePhase(phase.id, "up")}
                                disabled={idx === 0}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7"
                                onClick={() =>
                                  handleMovePhase(phase.id, "down")
                                }
                                disabled={
                                  idx === state.mission.phases.length - 1
                                }
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7"
                                onClick={() =>
                                  handleAddBehaviorToPhase(phase.id)
                                }
                              >
                                <Plus className="w-3 h-3 mr-1" /> Behavior
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-2 mt-3">
                            {phase.behaviors.length > 0 ? (
                              phase.behaviors.map((behavior, bIdx) => (
                                <div
                                  key={behavior.id}
                                  className={`p-3 border bg-card rounded-sm transition-all duration-200 ${
                                    behavior.groupIds.length > 0
                                      ? `border-l-4`
                                      : ""
                                  }`}
                                  style={{
                                    borderLeftColor:
                                      behavior.groupIds.length > 0
                                        ? stringToColor(
                                            getGroupNames(behavior.groupIds)
                                          )
                                        : undefined,
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                      {getBehaviorIcon(
                                        behavior.behaviorType as SupportedBehavior
                                      )}
                                      <span className="font-medium ml-2 text-sm">
                                        {behaviorConfigMap[
                                          behavior.behaviorType as keyof typeof behaviorConfigMap
                                        ]?.label || "Unknown Behavior"}
                                      </span>
                                    </div>
                                    <div className="flex space-x-1">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          handleMoveBehavior(
                                            behavior.id,
                                            phase.id,
                                            "up"
                                          )
                                        }
                                        disabled={bIdx === 0}
                                      >
                                        <ChevronUp className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          handleMoveBehavior(
                                            behavior.id,
                                            phase.id,
                                            "down"
                                          )
                                        }
                                        disabled={
                                          bIdx === phase.behaviors.length - 1
                                        }
                                      >
                                        <ChevronDown className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          handleEditBehavior(
                                            behavior.id,
                                            phase.id
                                          )
                                        }
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-6 w-6"
                                        onClick={() =>
                                          handleDeleteBehavior(behavior.id)
                                        }
                                      >
                                        <Trash2 className="w-3 h-3 text-red-500" />
                                      </Button>
                                    </div>
                                  </div>

                                  <Collapsible className="mt-2">
                                    <CollapsibleTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full flex justify-between p-1 h-6"
                                      >
                                        <span className="text-xs text-muted-foreground">
                                          Details
                                        </span>
                                        <ChevronDown className="h-3 w-3" />
                                      </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="text-sm space-y-2 pt-2">
                                      {behavior.groupIds?.length > 0 && (
                                        <div className="flex items-center text-muted-foreground">
                                          <User className="w-3 h-3 mr-1 flex-shrink-0" />
                                          <span className="truncate">
                                            {getGroupNames(behavior.groupIds)}
                                          </span>
                                        </div>
                                      )}

                                      <div className="flex flex-wrap gap-2">
                                        {behavior.delayMs && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            <Clock className="w-3 h-3 mr-1" />
                                            Delay: {behavior.delayMs}ms
                                          </Badge>
                                        )}

                                        {behavior.requiresApproval && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            <Check className="w-3 h-3 mr-1" />
                                            Approval Required
                                          </Badge>
                                        )}

                                        {behavior.skippable && (
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            <X className="w-3 h-3 mr-1" />
                                            Skippable
                                          </Badge>
                                        )}
                                      </div>
                                    </CollapsibleContent>
                                  </Collapsible>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-3 rounded-md bg-muted/30 text-muted-foreground text-sm">
                                No behaviors configured for this phase
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        )}
      </div>

      {/* Status Messages While Drawing */}
      {isDrawingMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white py-3 px-5 rounded-lg z-50 flex items-center shadow-2xl animate-in fade-in">
          <Loader className="animate-spin w-5 h-5 mr-3" />
          <span>
            {drawingForStagingArea
              ? "Drawing staging area. Click on map to place points."
              : "Setting behavior position. Click on map to place points."}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="ml-3 h-6 w-6 rounded-full hover:bg-white/20"
            onClick={cancelDrawing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {showSuccessMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-600/90 text-white py-3 px-5 rounded-lg z-50 flex items-center shadow-2xl animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 mr-3" />
          <span>Position saved!</span>
        </div>
      )}
    </>
  );
};
