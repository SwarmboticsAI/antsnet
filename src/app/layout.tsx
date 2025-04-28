import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Navigation } from "@/components/navigation";
import { ZenohWrapper } from "@/components/zenoh-wrapper";
import { Toaster } from "@/components/sonner";
import { MapProvider } from "@/providers/map-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { RobotProvider } from "@/providers/robot-provider";
import SessionProvider from "@/providers/session-provider";
import TeleopProvider from "@/providers/teleop-provider";
import BehaviorProvider from "@/providers/behavior-provider";
import { BehaviorStatusProvider } from "@/providers/behavior-status-provider";
import { BehaviorDrawingProvider } from "@/providers/behavior-drawing-provider";
import { GeoDrawProvider } from "@/providers/geo-drawing-provider";
import { MapFeatureProvider } from "@/providers/map-feature-provider";
import { QueryProvider } from "@/providers/query-provider";
import { MissionDraftProvider } from "@/providers/mission-draft-provider";
import { RobotAssignmentProvider } from "@/providers/robot-assignment-provider";
import { MissionProvider } from "@/providers/mission-provider";
import { RobotSelectionProvider } from "@/providers/robot-selection-provider";
import { BehaviorCreatorProvider } from "@/providers/behavior-creator-provider";
import { ProfileProvider } from "@/providers/profile-provider";
import { ProfileSetupWrapper } from "@/components/profile-setup-wrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swarmbotics AI :: ANTSNet",
  description: "Command and Control for Swarm Robotics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ZenohWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            disableTransitionOnChange
            enableSystem
          >
            <ProfileProvider>
              <ProfileSetupWrapper>
                <SessionProvider>
                  <RobotSelectionProvider>
                    <RobotProvider>
                      <QueryProvider>
                        <BehaviorProvider>
                          <BehaviorStatusProvider>
                            <GeoDrawProvider>
                              <BehaviorCreatorProvider>
                                <MissionDraftProvider>
                                  <MissionProvider>
                                    <RobotAssignmentProvider>
                                      <TeleopProvider>
                                        <MapProvider>
                                          <MapFeatureProvider>
                                            <BehaviorDrawingProvider>
                                              <Navigation />
                                              {children}
                                              <Toaster />
                                            </BehaviorDrawingProvider>
                                          </MapFeatureProvider>
                                        </MapProvider>
                                      </TeleopProvider>
                                    </RobotAssignmentProvider>
                                  </MissionProvider>
                                </MissionDraftProvider>
                              </BehaviorCreatorProvider>
                            </GeoDrawProvider>
                          </BehaviorStatusProvider>
                        </BehaviorProvider>
                      </QueryProvider>
                    </RobotProvider>
                  </RobotSelectionProvider>
                </SessionProvider>
              </ProfileSetupWrapper>
            </ProfileProvider>
          </ThemeProvider>
        </ZenohWrapper>
      </body>
    </html>
  );
}
