import { useMemo, useRef, useState } from "react";
import { COMPANIES, STATUS_OPTIONS } from "./data/companies";
import { OPPORTUNITIES } from "./data/opportunities";
import CompanyCard from "./components/CompanyCard";
import { useApplications } from "./hooks/useApplications";
import "./App.css";

const TYPE_FILTERS = ["All", "IFT", "911", "Hybrid"];

export default function App() {
  const { applications, loading, updateApp, exportData, importData, resetAll } =
    useApplications();
  const [section, setSection] = useState("ambulance");
  const isOther = section === "other";
  const companies = isOther ? OPPORTUNITIES : COMPANIES;
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [query, setQuery] = useState("");
  const [expandAll, setExpandAll] = useState(false);
  const fileRef = useRef(null);

  const stats = useMemo(() => {
    const values = companies.map((c) => applications[c.id] || {});
    return {
      researching: values.filter((a) => a.status === "researching").length,
      applied: values.filter((a) => a.status === "applied").length,
      interview: values.filter((a) => a.status === "interview").length,
      offer: values.filter((a) => a.status === "offer").length,
      inProgress: values.filter(
        (a) => a.status && !["not_applied", "pass", "rejected"].includes(a.status)
      ).length,
    };
  }, [applications, companies]);

  const filtered = useMemo(() => {
    let list = companies.filter((c) => {
      if (typeFilter !== "All" && c.type !== typeFilter) return false;
      const app = applications[c.id] || {};
      const status = app.status || "not_applied";
      if (statusFilter !== "all" && status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        const hay = `${c.name} ${c.area} ${c.summary} ${c.type} ${app.notes || ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    if (sortBy === "difficulty") {
      list = [...list].sort(
        (a, b) => a.difficulty - b.difficulty || a.name.localeCompare(b.name)
      );
    } else if (sortBy === "pay") {
      list = [...list].sort((a, b) => b.payMin - a.payMin);
    } else if (sortBy === "hireTime") {
      list = [...list].sort((a, b) => a.hireDays - b.hireDays);
    } else if (sortBy === "status") {
      const order = Object.fromEntries(
        STATUS_OPTIONS.map((s, i) => [s.value, i])
      );
      list = [...list].sort((a, b) => {
        const sa = applications[a.id]?.status || "not_applied";
        const sb = applications[b.id]?.status || "not_applied";
        return (order[sa] ?? 0) - (order[sb] ?? 0);
      });
    } else {
      // Default: top pick first, then difficulty, then name
      list = [...list].sort((a, b) => {
        if (a.topPick !== b.topPick) return a.topPick ? -1 : 1;
        if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
        return a.name.localeCompare(b.name);
      });
    }

    return list;
  }, [typeFilter, statusFilter, sortBy, query, applications, companies]);

  const iftCount = COMPANIES.filter((c) => c.type === "IFT").length;
  const c911Count = COMPANIES.filter((c) => c.type === "911").length;
  const hybridCount = COMPANIES.filter((c) => c.type === "Hybrid").length;

  if (loading) {
    return (
      <div className="shell loading">
        <p>Loading your tracker…</p>
      </div>
    );
  }

  return (
    <div className="shell">
      <header className="hero">
        <p className="brand">EMT Tracker</p>
        <h1>{isOther ? "Other EMT opportunities" : "Ambulance company applications"}</h1>
        <p className="lede">
          {isOther
            ? "Event-work leads near Westwood (90024), researched for a newly certified EMT. Eligibility notes distinguish applications from inquiries."
            : `${iftCount} IFT · ${c911Count} 911 · ${hybridCount} hybrid near UCLA — start IFT, transfer to 911. Progress saves in this browser.`}
        </p>
      </header>

      <nav className="section-nav" aria-label="Tracker sections">
        {[
          ["ambulance", "Ambulance companies", COMPANIES.length],
          ["other", "Other EMT opportunities", OPPORTUNITIES.length],
        ].map(([id, label, count]) => (
          <button key={id} type="button" aria-pressed={section === id}
            className={section === id ? "active" : ""}
            onClick={() => {
              setSection(id);
              setTypeFilter("All");
              setStatusFilter("all");
              setSortBy("default");
              setQuery("");
            }}>
            {label} <span>{count}</span>
          </button>
        ))}
      </nav>

      <section className="stats" aria-label="Application progress">
        {[
          { key: "all", label: isOther ? "Leads" : "Companies", value: companies.length },
          { key: "researching", label: "Researching", value: stats.researching },
          { key: "applied", label: "Applied", value: stats.applied },
          { key: "interview", label: "Interviews", value: stats.interview },
          { key: "offer", label: "Offers", value: stats.offer },
        ].map((stat) => (
          <button
            key={stat.key}
            type="button"
            className={`stat ${statusFilter === stat.key ? "active" : ""}`}
            onClick={() =>
              setStatusFilter((prev) =>
                prev === stat.key ? "all" : stat.key === "all" ? "all" : stat.key
              )
            }
          >
            <span className="stat-label">{stat.label}</span>
            <span className="stat-value">{stat.value}</span>
          </button>
        ))}
      </section>

      <section className="controls">
        <div className="search-wrap">
          <input
            type="search"
            placeholder="Search name, area, notes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search companies"
          />
        </div>

        <div className="filter-row">
          <div className="type-filters" role="group" aria-label="Filter by type">
            {(isOther ? ["All", "Events"] : TYPE_FILTERS).map((f) => (
              <button
                key={f}
                type="button"
                className={typeFilter === f ? "active" : ""}
                onClick={() => setTypeFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="control-actions">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort companies"
            >
              <option value="default">Sort: recommended</option>
              {!isOther && <>
                <option value="difficulty">Sort: hire difficulty</option>
                <option value="hireTime">Sort: hire speed</option>
                <option value="pay">Sort: starting pay</option>
              </>}
              <option value="status">Sort: application status</option>
            </select>

            <button
              type="button"
              className="ghost"
              onClick={() => setExpandAll((v) => !v)}
            >
              {expandAll ? "Collapse all" : "Expand all"}
            </button>
          </div>
        </div>
      </section>

      <p className="result-count">
        Showing {filtered.length} of {companies.length}
        {stats.inProgress > 0 && ` · ${stats.inProgress} in progress`}
      </p>

      <div className="company-list">
        {filtered.length === 0 ? (
          <p className="empty">No results match those filters.</p>
        ) : (
          filtered.map((company) => (
            <CompanyCard
              key={company.id}
              company={company}
              appData={applications[company.id] || {}}
              onUpdate={(updates) => updateApp(company.id, updates)}
              forceOpen={expandAll}
            />
          ))
        )}
      </div>

      <footer className="footer">
        <p>Your application data saves automatically in this browser.</p>
        <div className="footer-actions">
          <button type="button" className="ghost" onClick={exportData}>
            Export backup
          </button>
          <button
            type="button"
            className="ghost"
            onClick={() => fileRef.current?.click()}
          >
            Import backup
          </button>
          <button type="button" className="ghost danger" onClick={resetAll}>
            Reset
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) importData(file);
              e.target.value = "";
            }}
          />
        </div>
      </footer>
    </div>
  );
}
