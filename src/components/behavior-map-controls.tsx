// "use client";

// import React, { useState, useEffect } from "react";
// import { useMapContext, MapInteractionMode } from "@/providers/map-provider";
// import { useBehaviorDrawing } from "@/providers/behavior-drawing-provider";
// import { useBehaviors } from "@/providers/behavior-provider";
// import { useRobots } from "@/providers/robot-provider";
// import { Behavior } from "@/protos/generated/sbai_behavior_protos/behavior_request";
// import { BehaviorStatusUI } from "@/reducers/behavior-reducer";
// import { Robot } from "@/types/Robot";

// // A component to display behaviors on the map and handle interactions
// const BehaviorMapControls: React.FC = () => {
//   const { interactionMode } = useMapContext();

//   const {
//     // Drawing interactions
//     currentDraft,
//     startNewBehavior,
//     completeDraft,
//     cancelDraft,
//     removeLastPoint,
//     setParameterValue,
//     // Execution
//     executeBehavior,
//     isExecuting,
//     executionError,
//     // Visual tracking
//     highlightBehavior,
//   } = useBehaviorDrawing();

//   const { onlineRobots } = useRobots();
//   const { behaviorsByStatus, cancelBehavior } = useBehaviors();

//   // Selected robots for execution
//   const [selectedRobotIds, setSelectedRobotIds] = useState<string[]>([]);
//   // Show modal for completing behavior
//   const [showCompletionModal, setShowCompletionModal] = useState(false);
//   // Show success message
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);

//   // Check if we can complete a draft (have enough points)
//   const canCompleteDraft =
//     currentDraft &&
//     currentDraft.points.length > 0 &&
//     // Different behaviors need different point counts
//     ((interactionMode === MapInteractionMode.SELECTING_CENTER &&
//       currentDraft.points.length >= 1) ||
//       (interactionMode === MapInteractionMode.DRAWING_POINTS &&
//         currentDraft.points.length >= 2) ||
//       (interactionMode === MapInteractionMode.DRAWING_POLYGON &&
//         currentDraft.points.length >= 3) ||
//       (interactionMode === MapInteractionMode.DRAWING_PERIMETER &&
//         currentDraft.points.length >= 3));

//   // Auto-select all online robots when starting a new behavior
//   useEffect(() => {
//     if (currentDraft && selectedRobotIds.length === 0) {
//       // Don't auto-select for multi-waypoint navigation (single robot only)
//       if (
//         currentDraft.behaviorType ===
//         Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION
//       ) {
//         if (onlineRobots.length > 0) {
//           setSelectedRobotIds([onlineRobots[0].robotId]);
//         }
//       } else {
//         // Select all online robots for other behavior types
//         setSelectedRobotIds(onlineRobots.map((robot: Robot) => robot.robotId));
//       }
//     }
//   }, [currentDraft, onlineRobots, selectedRobotIds.length]);

//   // Clear success message after timeout
//   useEffect(() => {
//     if (successMessage) {
//       const timer = setTimeout(() => {
//         setSuccessMessage(null);
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [successMessage]);

//   // Handle robot selection
//   const handleRobotToggle = (robotId: string) => {
//     setSelectedRobotIds((prev) => {
//       if (prev.includes(robotId)) {
//         return prev.filter((id) => id !== robotId);
//       }

//       // For multi-waypoint, only allow one robot
//       if (
//         currentDraft?.behaviorType ===
//         Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION
//       ) {
//         return [robotId];
//       }

//       return [...prev, robotId];
//     });
//   };

//   // Handle behavior completion/execution
//   const handleExecuteBehavior = async () => {
//     if (!currentDraft || selectedRobotIds.length === 0) return;

//     // Complete the draft first
//     const draft = completeDraft();
//     if (!draft) return;

//     const behaviorId = await executeBehavior(selectedRobotIds);

//     if (behaviorId) {
//       setSuccessMessage(`Behavior started successfully: ${behaviorId}`);
//       setShowCompletionModal(false);
//       setSelectedRobotIds([]);
//     }
//   };

//   // Get behavior type name
//   const getBehaviorTypeName = (type: Behavior) => {
//     switch (type) {
//       case Behavior.BEHAVIOR_AREA_COVERAGE:
//         return "Area Coverage";
//       case Behavior.BEHAVIOR_DEFEND:
//         return "Defend";
//       case Behavior.BEHAVIOR_LINE_FORMATION:
//         return "Line Formation";
//       case Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION:
//         return "Multi-Waypoint Navigation";
//       case Behavior.BEHAVIOR_PATROL:
//         return "Patrol";
//       case Behavior.BEHAVIOR_RALLY:
//         return "Rally";
//       case Behavior.BEHAVIOR_RAPTOR:
//         return "Raptor";
//       case Behavior.BEHAVIOR_SURROUND:
//         return "Surround";
//       default:
//         return "Unknown";
//     }
//   };

//   return (
//     <>
//       {/* Behavior Controls Panel */}
//       <div className="absolute bg-background top-20 right-4 shadow-lg rounded-lg p-4 w-80 z-10">
//         <h2 className="text-lg font-bold mb-2">Behaviors</h2>

//         {/* Current Drawing Status */}
//         {interactionMode !== MapInteractionMode.VIEWING && currentDraft && (
//           <div className="mb-4 p-3 rounded-md">
//             <h3 className="font-semibold">
//               Drawing: {getBehaviorTypeName(currentDraft.behaviorType)}
//             </h3>
//             <p className="text-sm">
//               {interactionMode === MapInteractionMode.SELECTING_CENTER &&
//                 "Click to set center point"}
//               {interactionMode === MapInteractionMode.DRAWING_POINTS &&
//                 "Click to add waypoints"}
//               {interactionMode === MapInteractionMode.DRAWING_POLYGON &&
//                 "Click to draw area polygon"}
//               {interactionMode === MapInteractionMode.DRAWING_PERIMETER &&
//                 "Click to create perimeter"}
//             </p>
//             <p className="text-xs mt-1">Points: {currentDraft.points.length}</p>

//             {/* Parameter Controls */}
//             <div className="mt-2 space-y-2">
//               {currentDraft.behaviorType ===
//                 Behavior.BEHAVIOR_AREA_COVERAGE && (
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700">
//                     Lane Width (m)
//                   </label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="20"
//                     value={currentDraft.parameters.laneWidth || 5}
//                     onChange={(e) =>
//                       setParameterValue("laneWidth", parseFloat(e.target.value))
//                     }
//                     className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm"
//                   />
//                 </div>
//               )}

//               {currentDraft.behaviorType === Behavior.BEHAVIOR_RALLY && (
//                 <div>
//                   <label className="block text-xs font-medium text-gray-700">
//                     Rally Radius (m)
//                   </label>
//                   <input
//                     type="number"
//                     min="1"
//                     max="50"
//                     value={currentDraft.parameters.rallyRadius || 10}
//                     onChange={(e) =>
//                       setParameterValue(
//                         "rallyRadius",
//                         parseFloat(e.target.value)
//                       )
//                     }
//                     className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm"
//                   />
//                 </div>
//               )}

//               {/* Add parameter controls for other behavior types */}
//             </div>

//             {/* Drawing Controls */}
//             <div className="mt-3 flex space-x-2">
//               <button
//                 onClick={removeLastPoint}
//                 disabled={!currentDraft.points.length}
//                 className="px-2 py-1 text-xs rounded disabled:opacity-50"
//               >
//                 Undo Last Point
//               </button>

//               <button
//                 onClick={() => setShowCompletionModal(true)}
//                 disabled={!canCompleteDraft}
//                 className="px-2 py-1 text-xs bg-green-600 text-white rounded disabled:opacity-50"
//               >
//                 Complete
//               </button>

//               <button
//                 onClick={cancelDraft}
//                 className="px-2 py-1 text-xs bg-red-600 text-white rounded"
//               >
//                 Cancel
//               </button>
//             </div>

//             {/* Error message */}
//             {executionError && (
//               <div className="mt-2 text-xs text-red-600">{executionError}</div>
//             )}
//           </div>
//         )}

//         {/* Behavior Type Selection (when not drawing) */}
//         {interactionMode === MapInteractionMode.VIEWING && !currentDraft && (
//           <div className="mb-4">
//             <h3 className="font-semibold mb-2">Create New Behavior</h3>
//             <div className="grid grid-cols-2 gap-2">
//               <button
//                 onClick={() =>
//                   startNewBehavior(Behavior.BEHAVIOR_AREA_COVERAGE)
//                 }
//                 className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Area Coverage
//               </button>
//               <button
//                 onClick={() => startNewBehavior(Behavior.BEHAVIOR_PATROL)}
//                 className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Patrol
//               </button>
//               <button
//                 onClick={() => startNewBehavior(Behavior.BEHAVIOR_RALLY)}
//                 className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Rally
//               </button>
//               <button
//                 onClick={() =>
//                   startNewBehavior(Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION)
//                 }
//                 className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
//               >
//                 Navigation
//               </button>
//               {/* Add more behavior types as needed */}
//             </div>
//           </div>
//         )}

//         {/* Active Behaviors */}
//         <div>
//           <h3 className="font-semibold mb-2">Active Behaviors</h3>
//           <div className="space-y-2 max-h-60 overflow-y-auto">
//             {behaviorsByStatus[BehaviorStatusUI.ACTIVE].length === 0 && (
//               <p className="text-sm text-gray-500">No active behaviors</p>
//             )}

//             {behaviorsByStatus[BehaviorStatusUI.ACTIVE].map((behavior) => (
//               <div
//                 key={behavior.behaviorId}
//                 className="p-2 border rounded-md text-sm hover:bg-gray-50 cursor-pointer"
//                 onMouseEnter={() => highlightBehavior(behavior.behaviorId)}
//                 onMouseLeave={() => highlightBehavior(null)}
//               >
//                 <div className="flex justify-between">
//                   <span className="font-medium">
//                     {getBehaviorTypeName(behavior.behaviorType)}
//                   </span>
//                   <span className="text-xs bg-green-100 px-1 rounded">
//                     Active
//                   </span>
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   {behavior.robotIds.length} robots •{" "}
//                   {behavior.createdAt.toLocaleTimeString()}
//                 </div>
//                 <button
//                   onClick={() => cancelBehavior(behavior.behaviorId)}
//                   className="mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-800 rounded hover:bg-red-200"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Behavior Completion Modal */}
//       {showCompletionModal && currentDraft && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
//           <div className="rounded-lg p-6 w-96 max-w-full">
//             <h2 className="text-lg font-bold mb-4">Complete Behavior</h2>

//             <div className="mb-4">
//               <h3 className="font-medium mb-2">Select Robots</h3>

//               {currentDraft.behaviorType ===
//                 Behavior.BEHAVIOR_MULTI_WAYPOINT_NAVIGATION && (
//                 <p className="text-xs text-amber-600 mb-2">
//                   Multi-waypoint navigation requires exactly one robot.
//                 </p>
//               )}

//               <div className="max-h-40 overflow-y-auto border rounded p-2">
//                 {onlineRobots.length === 0 ? (
//                   <p className="text-sm text-gray-500">No robots available</p>
//                 ) : (
//                   onlineRobots.map((robot: Robot) => (
//                     <div key={robot.robotId} className="flex items-center mb-1">
//                       <input
//                         type="checkbox"
//                         id={`robot-${robot.robotId}`}
//                         checked={selectedRobotIds.includes(robot.robotId)}
//                         onChange={() => handleRobotToggle(robot.robotId)}
//                         className="mr-2"
//                       />
//                       <label
//                         htmlFor={`robot-${robot.robotId}`}
//                         className="text-sm"
//                       >
//                         {robot.robotId}
//                       </label>
//                     </div>
//                   ))
//                 )}
//               </div>
//             </div>

//             <div className="flex justify-end space-x-2">
//               <button
//                 onClick={() => setShowCompletionModal(false)}
//                 className="px-4 py-2 text-sm rounded"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={handleExecuteBehavior}
//                 disabled={selectedRobotIds.length === 0 || isExecuting}
//                 className="px-4 py-2 text-sm bg-green-600 text-white rounded disabled:opacity-50"
//               >
//                 {isExecuting ? "Executing..." : "Execute Behavior"}
//               </button>
//             </div>

//             {executionError && (
//               <div className="mt-2 text-sm text-red-600">{executionError}</div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Success Message Toast */}
//       {successMessage && (
//         <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
//           {successMessage}
//         </div>
//       )}
//     </>
//   );
// };

// export default BehaviorMapControls;
