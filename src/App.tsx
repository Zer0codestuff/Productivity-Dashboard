import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import GamifiedStatsDashboard from "./GamifiedStatsDashboard";

function App() {
  return (
    <>
      <GamifiedStatsDashboard />
      <Analytics />
      <SpeedInsights />
    </>
  );
}

export default App;
