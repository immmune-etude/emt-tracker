import { useState } from "react";
import { STATUS_OPTIONS, TYPE_STYLE } from "../data/companies";

function StatusBadge({ value }) {
  const s = STATUS_OPTIONS.find((o) => o.value === value) || STATUS_OPTIONS[0];
  return (
    <span className="status-badge" style={{ "--status": s.color }}>
      {s.label}
    </span>
  );
}

function DiffDots({ n }) {
  return (
    <span className="diff-dots" aria-label={`Difficulty ${n} of 3`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= n ? "on" : ""} />
      ))}
    </span>
  );
}

export default function CompanyCard({ company, appData, onUpdate, forceOpen }) {
  const [expanded, setExpanded] = useState(false);
  const open = forceOpen || expanded;
  const ts = TYPE_STYLE[company.type] || TYPE_STYLE.Hybrid;
  const status = appData.status || "not_applied";

  return (
    <article
      className={`company-card ${company.topPick ? "top-pick" : ""} ${open ? "open" : ""}`}
    >
      <button
        type="button"
        className="card-header"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={open}
      >
        <div className="card-main">
          <div className="card-title-row">
            <h2>{company.name}</h2>
            {company.topPick && <span className="chip chip-pick">Top pick</span>}
            {!company.entryFriendly && (
              <span className="chip chip-warn">Age 23+</span>
            )}
          </div>
          <div className="card-meta">
            <span
              className="type-pill"
              style={{
                background: ts.bg,
                color: ts.color,
                borderColor: ts.border,
              }}
            >
              {company.type}
            </span>
            <span>{company.pay}</span>
            <span className="dot">·</span>
            <span>{company.hireTime}</span>
            <span className="dot">·</span>
            <DiffDots n={company.difficulty} />
            <span className="diff-label">{company.difficultyLabel}</span>
          </div>
          <p className="card-summary">{company.summary}</p>
          <p className="card-area">{company.area}</p>
        </div>
        <div className="card-side">
          <StatusBadge value={status} />
          <span className="expand-hint">{open ? "Less" : "More"}</span>
        </div>
      </button>

      {open && (
        <div className="card-body">
          <div className="pros-cons">
            <div>
              <h3>Pros</h3>
              <ul>
                {company.pros.map((p) => (
                  <li key={p}>
                    <span className="plus">+</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3>Cons</h3>
              <ul>
                {company.cons.map((c) => (
                  <li key={c}>
                    <span className="minus">−</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="info-block">
            <h3>Interview notes</h3>
            <p>{company.interviewNotes}</p>
            <h3>Requirements</h3>
            <p>{company.requirements}</p>
            <h3>Hiring status</h3>
            <p>{company.hiringStatus}</p>
          </div>

          <div className="tracker-fields">
            <label>
              <span>Application status</span>
              <select
                value={status}
                onChange={(e) => onUpdate({ status: e.target.value })}
                onClick={(e) => e.stopPropagation()}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Date applied</span>
              <input
                type="date"
                value={appData.dateApplied || ""}
                onChange={(e) => onUpdate({ dateApplied: e.target.value })}
                onClick={(e) => e.stopPropagation()}
              />
            </label>
          </div>

          <label className="notes-field">
            <span>Notes</span>
            <textarea
              value={appData.notes || ""}
              onChange={(e) => onUpdate({ notes: e.target.value })}
              onClick={(e) => e.stopPropagation()}
              placeholder="Contact name, follow-up dates, interview prep…"
              rows={3}
            />
          </label>

          <a
            className="apply-link"
            href={company.website}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            Open careers page
            <span aria-hidden>→</span>
          </a>
        </div>
      )}
    </article>
  );
}
