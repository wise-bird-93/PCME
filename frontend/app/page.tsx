
"use client";

import { useState } from "react";

type ActivityCategory =
  | "Education"
  | "Coding"
  | "Professional Work"
  | "Music"
  | "Comedy"
  | "Other";

type Activity = {
  id: string;
  category: ActivityCategory;
  device: string;
  source: string;
  start: string;
  end: string;
  durationSeconds: number;
};

const categories: ActivityCategory[] = [
  "Education",
  "Coding",
  "Professional Work",
  "Music",
  "Comedy",
  "Other",
];

const categoryColors: Record<ActivityCategory, string> = {
  Education: "#6488f5",
  Coding: "#25a999",
  "Professional Work": "#e9a34b",
  Music: "#a17bea",
  Comedy: "#ed7b87",
  Other: "#8a97aa",
};

const navItems = [
  { label: "Overview", icon: "◈" },
  { label: "Daily Report", icon: "▦" },
  { label: "Weekly Report", icon: "▤" },
  { label: "Monthly Report", icon: "▥" },
  { label: "Devices", icon: "▣" },
];

function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function getLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getDateRange(period: string, selectedDate: string) {
  const selected = new Date(`${selectedDate}T12:00:00`);
  const start = new Date(selected);
  const end = new Date(selected);

  if (period === "Weekly Report") {
    const day = (selected.getDay() + 6) % 7;
    start.setDate(selected.getDate() - day);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
  } else if (period === "Monthly Report") {
    start.setDate(1);
    end.setMonth(selected.getMonth() + 1, 0);
  }

  return {
    start: getLocalDate(start),
    end: getLocalDate(end),
  };
}

export default function Home() {
  const [activePage, setActivePage] = useState("Overview");
  const [selectedDate, setSelectedDate] = useState(getLocalDate(new Date()));
  const [activities] = useState<Activity[]>([]);
  const [connectedDevices] = useState<string[]>([]);
  const [showCategories, setShowCategories] = useState(false);

  const range = getDateRange(activePage, selectedDate);

  const filteredActivities = activities.filter((activity) => {
    const date = activity.start.slice(0, 10);
    return date >= range.start && date <= range.end;
  });

  const categoryTotals = categories.map((category) => {
    const seconds = filteredActivities
      .filter((activity) => activity.category === category)
      .reduce((sum, activity) => sum + activity.durationSeconds, 0);

    return { category, seconds };
  });

  const totalSeconds = categoryTotals.reduce(
    (sum, item) => sum + item.seconds,
    0
  );

  const dateLabel = new Date(`${selectedDate}T12:00:00`).toLocaleDateString(
    "en-IN",
    { day: "numeric", month: "long", year: "numeric" }
  );

  return (
    <main className="pcme-app">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">P</div>
          <div>
            <h2>PCME</h2>
            <p>Personal Cloud Memory</p>
          </div>
        </div>

        <div className="nav-heading">WORKSPACE</div>

        <nav className="navigation">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${
                activePage === item.label ? "active" : ""
              }`}
              onClick={() => setActivePage(item.label)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="privacy-icon">⌁</div>
          <h3>Your time, your data.</h3>
          <p>
            Understand your digital habits with transparent, user-controlled
            activity records.
          </p>
          <div className="privacy-status">
            <span className="status-dot" />
            Backend connection pending
          </div>
        </div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="breadcrumb">
            PCME <span>/</span> {activePage}
          </div>
          <div className="account">
            <div className="account-avatar">U</div>
            <div>
              <strong>My Workspace</strong>
              <p>Local prototype</p>
            </div>
          </div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div>
              <div className="eyebrow">DIGITAL WELLBEING</div>
              <h1>
                {activePage === "Overview"
                  ? "Your digital life, in perspective."
                  : activePage}
              </h1>
              <p className="page-description">
                {activePage === "Overview"
                  ? "Understand where your time goes and build more mindful habits."
                  : "Explore your digital activity with clear, date-based reports."}
              </p>
            </div>

            <div className="date-control">
              <label htmlFor="report-date">Report date</label>
              <input
                id="report-date"
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
              />
            </div>
          </div>

          <div className="notice">
            <span className="notice-icon">i</span>
            <div>
              <strong>Frontend prototype</strong>
              <p>
                No activity data has been connected yet. Totals will appear
                after the backend starts receiving and saving real activity
                records.
              </p>
            </div>
          </div>

          {activePage === "Overview" && (
            <>
              <div className="section-heading">
                <div>
                  <h2>Activity overview</h2>
                  <p>Your current account activity summary</p>
                </div>
                <span className="range-chip">Today</span>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Total tracked time</span>
                    <span className="stat-icon blue">◷</span>
                  </div>
                  <h3>{formatDuration(totalSeconds)}</h3>
                  <p>Based on saved activity records</p>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span>Activity records</span>
                    <span className="stat-icon green">▤</span>
                  </div>
                  <h3>{filteredActivities.length}</h3>
                  <p>Records in the selected period</p>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span>Connected devices</span>
                    <span className="stat-icon purple">▣</span>
                  </div>
                  <h3>{connectedDevices.length}</h3>
                  <p>Device sync is not configured yet</p>
                </div>
              </div>

              <div className="dashboard-grid">
                <section className="panel category-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Time by category</h2>
                      <p>How your tracked time is distributed</p>
                    </div>
                    <button
                      className="text-button"
                      onClick={() => setShowCategories(!showCategories)}
                    >
                      {showCategories ? "Show less" : "View categories"}
                    </button>
                  </div>

                  {totalSeconds === 0 ? (
                    <div className="empty-state">
                      <div className="empty-illustration">◷</div>
                      <h3>No activity data yet</h3>
                      <p>
                        Once activity records are saved, this chart will show
                        your actual time by category.
                      </p>
                    </div>
                  ) : (
                    <div className="category-list">
                      {categoryTotals
                        .filter((item) => item.seconds > 0)
                        .map((item) => (
                          <div className="category-row" key={item.category}>
                            <div className="category-info">
                              <span
                                className="category-dot"
                                style={{
                                  backgroundColor:
                                    categoryColors[item.category],
                                }}
                              />
                              <span>{item.category}</span>
                              <strong>
                                {formatDuration(item.seconds)}
                              </strong>
                            </div>
                            <div className="progress-track">
                              <div
                                className="progress-fill"
                                style={{
                                  width: `${
                                    (item.seconds / totalSeconds) * 100
                                  }%`,
                                  backgroundColor:
                                    categoryColors[item.category],
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}

                  {showCategories && (
                    <div className="category-chips">
                      {categories.map((category) => (
                        <span key={category}>{category}</span>
                      ))}
                    </div>
                  )}
                </section>

                <section className="panel sync-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Across your devices</h2>
                      <p>One account, one shared history</p>
                    </div>
                    <span className="stat-icon purple">⌘</span>
                  </div>

                  <div className="device-preview">
                    <span className="device-symbol">▱</span>
                    <div>
                      <strong>Laptop</strong>
                      <p>Waiting for device registration</p>
                    </div>
                    <span className="pending-tag">Pending</span>
                  </div>

                  <div className="device-preview">
                    <span className="device-symbol">▯</span>
                    <div>
                      <strong>Phone</strong>
                      <p>Waiting for device registration</p>
                    </div>
                    <span className="pending-tag">Pending</span>
                  </div>

                  <p className="sync-note">
                    Multi-device synchronization will be enabled after account
                    authentication and backend APIs are implemented.
                  </p>

                  <button
                    className="secondary-button full-button"
                    onClick={() => setActivePage("Devices")}
                  >
                    View devices
                  </button>
                </section>
              </div>

              <div className="section-heading lower-heading">
                <div>
                  <h2>Reports</h2>
                  <p>Review your time over different periods</p>
                </div>
              </div>

              <div className="report-cards">
                {[
                  {
                    title: "Daily report",
                    description: "Review activity for a particular date.",
                    page: "Daily Report",
                    icon: "▦",
                  },
                  {
                    title: "Weekly report",
                    description: "Understand your week at a glance.",
                    page: "Weekly Report",
                    icon: "▤",
                  },
                  {
                    title: "Monthly report",
                    description: "Explore your monthly time patterns.",
                    page: "Monthly Report",
                    icon: "▥",
                  },
                ].map((report) => (
                  <button
                    className="report-card"
                    key={report.page}
                    onClick={() => setActivePage(report.page)}
                  >
                    <span className="report-icon">{report.icon}</span>
                    <strong>{report.title}</strong>
                    <p>{report.description}</p>
                    <span className="report-link">Open report →</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {activePage === "Daily Report" && (
            <section className="panel report-panel">
              <div className="panel-heading">
                <div>
                  <h2>Daily activity report</h2>
                  <p>Selected date: {dateLabel}</p>
                </div>
                <span className="range-chip">1 day</span>
              </div>

              <div className="report-total">
                <span>Total tracked time</span>
                <strong>{formatDuration(totalSeconds)}</strong>
                <p>Calculated from activity records for this date.</p>
              </div>

              {filteredActivities.length === 0 ? (
                <EmptyReport />
              ) : (
                <ActivityTable activities={filteredActivities} />
              )}
            </section>
          )}

          {activePage === "Weekly Report" && (
            <section className="panel report-panel">
              <div className="panel-heading">
                <div>
                  <h2>Weekly activity report</h2>
                  <p>
                    {range.start} to {range.end}
                  </p>
                </div>
                <span className="range-chip">7 days</span>
              </div>

              <div className="report-total">
                <span>Total tracked time this week</span>
                <strong>{formatDuration(totalSeconds)}</strong>
                <p>Week starts on Monday and ends on Sunday.</p>
              </div>

              {filteredActivities.length === 0 ? (
                <EmptyReport />
              ) : (
                <CategorySummary totals={categoryTotals} />
              )}
            </section>
          )}

          {activePage === "Monthly Report" && (
            <section className="panel report-panel">
              <div className="panel-heading">
                <div>
                  <h2>Monthly activity report</h2>
                  <p>
                    {range.start} to {range.end}
                  </p>
                </div>
                <span className="range-chip">1 month</span>
              </div>

              <div className="report-total">
                <span>Total tracked time this month</span>
                <strong>{formatDuration(totalSeconds)}</strong>
                <p>Calculated from saved activity records in this month.</p>
              </div>

              {filteredActivities.length === 0 ? (
                <EmptyReport />
              ) : (
                <CategorySummary totals={categoryTotals} />
              )}
            </section>
          )}

          {activePage === "Devices" && (
            <>
              <div className="section-heading">
                <div>
                  <h2>Your devices</h2>
                  <p>Devices associated with your PCME account</p>
                </div>
              </div>

              <section className="panel devices-panel">
                <div className="empty-state">
                  <div className="empty-illustration">▣</div>
                  <h3>No devices registered</h3>
                  <p>
                    Device registration will become available after login and
                    backend integration are complete.
                  </p>
                </div>

                <div className="device-requirements">
                  <h3>How device sync will work</h3>
                  <ul>
                    <li>Sign in with the same account on each device.</li>
                    <li>Save activity records to the shared backend.</li>
                    <li>Sync pending records when a device reconnects.</li>
                    <li>View the same date-wise reports on every device.</li>
                  </ul>
                </div>
              </section>
            </>
          )}

          <footer className="footer">
            <span>PCME · Personal Cloud Memory Engine</span>
            <span>Prototype · Real activity integration pending</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

function EmptyReport() {
  return (
    <div className="empty-state report-empty">
      <div className="empty-illustration">▤</div>
      <h3>No saved activity for this period</h3>
      <p>
        This does not necessarily mean zero usage. The backend and activity
        collection have not been connected yet.
      </p>
    </div>
  );
}

function CategorySummary({
  totals,
}: {
  totals: { category: ActivityCategory; seconds: number }[];
}) {
  return (
    <div className="category-list report-category-list">
      {totals.map((item) => (
        <div className="category-row" key={item.category}>
          <div className="category-info">
            <span
              className="category-dot"
              style={{ backgroundColor: categoryColors[item.category] }}
            />
            <span>{item.category}</span>
            <strong>{formatDuration(item.seconds)}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityTable({ activities }: { activities: Activity[] }) {
  return (
    <div className="table-wrapper">
      <table className="activity-table">
        <thead>
          <tr>
            <th>Category</th>
            <th>Device</th>
            <th>Source</th>
            <th>Start</th>
            <th>End</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          {activities.map((activity) => (
            <tr key={activity.id}>
              <td>{activity.category}</td>
              <td>{activity.device}</td>
              <td>{activity.source}</td>
              <td>{activity.start}</td>
              <td>{activity.end}</td>
              <td>{formatDuration(activity.durationSeconds)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
