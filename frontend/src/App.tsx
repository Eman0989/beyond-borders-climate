
import { lazy, Suspense } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";

import Home from "./pages/Home";
import AppLayout from "./components/layout/AppLayout";

// ========================================
// LAZY-LOADED APPLICATION PAGES
// ========================================

const Dashboard = lazy(
  () => import("./pages/Dashboard")
);

const ClimateExplorer = lazy(
  () => import("./pages/ClimateExplorer")
);

const Compare = lazy(
  () => import("./pages/Compare")
);

// SME Climate Simulator
const Simulator = lazy(
  () => import("./pages/Simulator")
);

// ========================================
// LOADING SCREEN
// ========================================

function PageLoader() {
  return (
    <div
      role="status"
      className="flex min-h-[65vh] flex-col items-center justify-center gap-5 bg-[#071310] text-white"
    >
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-400/20 border-t-emerald-400" />

      <div className="text-center">
        <p className="text-lg font-semibold text-emerald-400">
          Beyond Borders Climate
        </p>

        <p className="mt-2 text-sm text-slate-400">
          Loading climate intelligence...
        </p>
      </div>
    </div>
  );
}

// ========================================
// PLACEHOLDER FOR FUTURE FEATURES
// ========================================

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-emerald-300">
        Under Development
      </div>

      <h1 className="text-3xl font-semibold text-white md:text-4xl">
        {title}
      </h1>

      <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
        This feature is currently being developed for
        Beyond Borders Climate.
      </p>

      <Link
        to="/dashboard"
        className="mt-8 inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 font-semibold text-[#071310] transition hover:bg-emerald-300"
      >
        Return to Dashboard
      </Link>
    </div>
  );
}

// ========================================
// MAIN APPLICATION ROUTER
// ========================================

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC LANDING PAGE */}
          <Route path="/" element={<Home />} />

          {/* CLIMATE INTELLIGENCE PLATFORM */}
          <Route element={<AppLayout />}>
            
            {/* MAIN DASHBOARD */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* 3D CLIMATE EXPLORER */}
            <Route
              path="/explorer"
              element={<ClimateExplorer />}
            />

            {/* COUNTRY COMPARISON */}
            <Route
              path="/compare"
              element={<Compare />}
            />

            {/* SME CLIMATE SIMULATOR — ACTIVE */}
            <Route
              path="/simulator"
              element={<Simulator />}
            />

            {/* AI POLICY ASSISTANT — COMING SOON */}
            <Route
              path="/assistant"
              element={
                <ComingSoon title="AI Policy Assistant" />
              }
            />
          </Route>

          {/* FALLBACK FOR UNKNOWN ROUTES */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
