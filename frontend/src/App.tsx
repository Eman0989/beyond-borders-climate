
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

// Lazy-load heavier pages only when needed
const Dashboard = lazy(() => import("./pages/Dashboard"));

const ClimateExplorer = lazy(
  () => import("./pages/ClimateExplorer")
);

// Reusable loading screen
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

// Placeholder for features we haven't built yet
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

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* PUBLIC LANDING PAGE */}
          <Route path="/" element={<Home />} />

          {/* CLIMATE PLATFORM */}
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/explorer"
              element={<ClimateExplorer />}
            />

            <Route
              path="/simulator"
              element={
                <ComingSoon title="SME Climate Simulator" />
              }
            />

            <Route
              path="/assistant"
              element={
                <ComingSoon title="AI Policy Assistant" />
              }
            />

            <Route
              path="/compare"
              element={
                <ComingSoon title="Country Comparison" />
              }
            />
          </Route>

          {/* FALLBACK ROUTE */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
