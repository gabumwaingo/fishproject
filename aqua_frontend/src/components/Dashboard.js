import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Tooltip, Legend
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import ChartCard from './ChartCard';

/* -- register Chart.js components once -- */
ChartJS.register(
  CategoryScale, LinearScale, BarElement, ArcElement,
  PointElement, LineElement, Tooltip, Legend
);

/* Brand & colour-blind-safe palette */
const BLUE   = '#3E62AD';   // UI accent
const ORANGE = '#FF9F40';   // series 1
const RED    = '#E76F51';   // series 2

export default function Dashboard() {
  // Move all hooks to the top
  const [raw, setRaw] = useState([]);        // catches[]
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [range, setRange]   = useState('daily');

  /* helper to bucket by day (YYYY-MM-DD) */
  const bucket = (arr, startDate) => {
    const out = {};
    arr.forEach(({ date, quantity, price }) => {
      const key = date.slice(0, 10);                // 2025-06-03
      if (!startDate || key >= startDate) {
        out[key] ??= { qty: 0, earn: 0 };
        out[key].qty  += quantity;
        out[key].earn += price;
      }
    });
    return out;
  };

  /* species and buyer tallies */
  const tally = (arr, field) =>
    arr.reduce((acc, c) => {
      acc[c[field]] = (acc[c[field]] || 0) + (field === 'buyer' ? c.price : c.quantity);
      return acc;
    }, {});

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('/catches', { headers: { Authorization: 'Bearer ' + token } })
      .then(r => r.json())
      .then(data => { setRaw(data.catches || []); setLoading(false); })
      .catch(() => { setError('Could not load data'); setLoading(false); });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error)   return <p className="text-danger">{error}</p>;

  /* ==== date helpers ==== */
  const todayISO = new Date().toISOString().slice(0, 10);
  const monday   = (() => {
    const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().slice(0, 10);
  })();

  /* ====== LINE & BAR (daily vs weekly) ====== */
  const byDay = bucket(raw, range === 'weekly' ? monday : todayISO);
  const dayLabels  = Object.keys(byDay).sort();
  const qtyValues  = dayLabels.map(k => byDay[k].qty);
  const earnValues = dayLabels.map(k => byDay[k].earn);

  /* ====== Species & Buyers ====== */
  const speciesTally = tally(raw, 'species');
  const buyerTally   = tally(raw, 'buyer');
  const topBuyers    = Object.entries(buyerTally)
                             .sort((a,b)=>b[1]-a[1])
                             .slice(0,5);                // top-5

  /* chart data/opts */
  const qtyLine = {
    labels: dayLabels,
    datasets: [{ label: 'Kg caught', data: qtyValues,
                 borderColor: ORANGE, backgroundColor: ORANGE,
                 tension: .3, fill: false }]
  };
  const earnBar = {
    labels: dayLabels,
    datasets: [{ label: 'Earnings (KES)', data: earnValues,
                 backgroundColor: RED }]
  };
  const speciesPie = {
    labels: Object.keys(speciesTally),
    datasets: [{ data: Object.values(speciesTally),
                 backgroundColor: [ORANGE, RED, '#F4A261', '#2A9D8F', '#E9C46A'] }]
  };
  const buyerBar = {
    labels: topBuyers.map(b=>b[0]),
    datasets: [{ data: topBuyers.map(b=>b[1]),
                 backgroundColor: ORANGE }]
  };
  const horizOpts = { indexAxis: 'y' };

  /* pill JSX (re-used on two cards) */
  const Pills = (
    <ul className="nav nav-pills gap-1">
      {['daily','weekly'].map(key=>(
        <li className="nav-item" key={key}>
          <button
            className={'nav-link '+(range===key?'active':'')}
            style={{ padding: '0.15rem 0.6rem' }}
            onClick={()=>setRange(key)}
          >{key}</button>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="container-fluid">
      <div className="row g-3">
        {/* Qty line */}
        <div className="col-lg-6">
          <ChartCard title="Total Fish Caught" pillTabs={Pills}>
            <Line data={qtyLine} options={{ plugins:{legend:{display:false}} }} />
          </ChartCard>
        </div>

        {/* Earnings bar */}
        <div className="col-lg-6">
          <ChartCard title="Earnings (KES)" pillTabs={Pills}>
            <Bar data={earnBar} options={{ plugins:{legend:{display:false}} }} />
          </ChartCard>
        </div>

        {/* Species doughnut */}
        <div className="col-lg-6 col-xl-4">
          <ChartCard title="Species Breakdown">
            <Doughnut data={speciesPie} />
          </ChartCard>
        </div>

        {/* Top buyers horizontal bar */}
        <div className="col-lg-6 col-xl-8">
          <ChartCard title="Top Buyers (KES)">
            <Bar data={buyerBar} options={horizOpts} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
