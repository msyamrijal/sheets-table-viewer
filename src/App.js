
import React, { useEffect, useState } from 'react';
import './App.css';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcEUYNKssh36NHW_Rk7D89EFDt-ZWFdKxQI32L_Q1exbwNhHuGHWKh_W8VFSA8E58vjhVrumodkUv9/pub?gid=0&single=true&output=csv';

function App() {
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(SHEET_URL)
      .then((res) => res.text())
      .then((csv) => {
        // Parse CSV to array
        const rows = csv.split('\n').map(row => row.split(','));
        setTableData(rows);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to fetch sheet: ' + err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <h1>Google Sheets Data Viewer</h1>
      <p style={{ fontSize: '0.9em' }}>
        Data source: <a href={SHEET_URL} target="_blank" rel="noopener noreferrer">Google Sheets</a>
      </p>
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && tableData.length > 0 && (
        <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 16 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {tableData.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} style={{ border: '1px solid #ddd', padding: 8 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ marginTop: 32, fontSize: '0.8em', color: '#888' }}>
        To use a different sheet, edit <code>SHEET_URL</code> in <code>src/App.js</code>.
      </p>
    </div>
  );
}

export default App;
