import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout components
import { FullWidthLayout } from "@/layouts/full";

// Page components
import { Home } from "@/pages/Home";
import { Missions } from "@/pages/Missions";
import { Streams } from "@/pages/Streams";
import { Teleop } from "@/pages/Teleop";
import { Debug } from "@/pages/Debug";
import { Settings } from "@/pages/Settings";

import { ProfileSetupWrapper } from "@/components/profile-setup-wrapper";
import { ProfileProvider } from "@/providers/profile-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { BehaviorCreatorProvider } from "@/providers/behavior-creator-provider";
import { GeoDrawProvider } from "@/providers/geo-drawing-provider";
import { MapProvider } from "@/providers/map-provider";
import { RobotSelectionProvider } from "@/providers/robot-selection-provider";
import { TeleopProvider } from "@/providers/teleop-provider";

import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <ProfileProvider>
          <ProfileSetupWrapper>
            <RobotSelectionProvider>
              <GeoDrawProvider>
                <BehaviorCreatorProvider>
                  <MapProvider>
                    <TeleopProvider>
                      <Routes>
                        <Route path="/" element={<FullWidthLayout />}>
                          <Route index element={<Home />} />
                          <Route path="missions" element={<Missions />} />
                          <Route path="streams" element={<Streams />} />
                          <Route path="teleop" element={<Teleop />} />
                          <Route path="/info" element={<Debug />} />
                          <Route path="/settings" element={<Settings />} />
                        </Route>

                        <Route path="*" element={<div>404 - Not Found</div>} />
                      </Routes>
                    </TeleopProvider>
                  </MapProvider>
                </BehaviorCreatorProvider>
              </GeoDrawProvider>
            </RobotSelectionProvider>
          </ProfileSetupWrapper>
        </ProfileProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
