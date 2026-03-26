import { Analytics } from "@vercel/analytics/react";
import GamifiedStatsDashboard from "./GamifiedStatsDashboard";

function App() {
  return (
    <>
      <GamifiedStatsDashboard />
      <Analytics />
    </>
  );
}

export default App;
