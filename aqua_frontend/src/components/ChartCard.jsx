import React from 'react';

/* Bootstrap card with a header row for pill tabs (optional) */
export default function ChartCard({ title, pillTabs, children }) {
  return (
    <div className="card shadow-sm h-100">
      <div className="card-header bg-white">
        <div className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0 fw-bold">{title}</h6>
          {pillTabs}
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}
