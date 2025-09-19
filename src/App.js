
import React, { useEffect, useState } from 'react';
import { gapi } from 'gapi-script';
// GAPI config
const CLIENT_ID = '601887593143-5rvlhli8cqal992rtsl1r6n1nefpf65m.apps.googleusercontent.com';
const API_KEY = '';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';
const DISCOVERY_DOCS = [
  'https://sheets.googleapis.com/$discovery/rest?version=v4',
];
import './App.css';

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTcEUYNKssh36NHW_Rk7D89EFDt-ZWFdKxQI32L_Q1exbwNhHuGHWKh_W8VFSA8E58vjhVrumodkUv9/pub?gid=0&single=true&output=csv';

function App() {
  const [tableData, setTableData] = useState([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState([]);
  const [submitMsg, setSubmitMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRows, setShowRows] = useState(10);
  const [filter, setFilter] = useState('');

  // GAPI init
  useEffect(() => {
    function start() {
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        const auth = gapi.auth2.getAuthInstance();
        function updateSigninStatus(isSignedIn) {
          setIsSignedIn(isSignedIn);
          if (isSignedIn) {
            const profile = auth.currentUser.get().getBasicProfile();
            setUser({
              name: profile.getName(),
              email: profile.getEmail(),
              imageUrl: profile.getImageUrl(),
            });
          } else {
            setUser(null);
          }
        }
        // Initial status
        updateSigninStatus(auth.isSignedIn.get());
        // Listen for sign-in state changes.
        auth.isSignedIn.listen(updateSigninStatus);
      }).catch((err) => {
        setError('GAPI init error: ' + err.error);
      });
    }
    gapi.load('client:auth2', start);
  }, []);

  // Fetch CSV for display only
  useEffect(() => {
  // Google login/logout handlers
  const handleLogin = () => {
    gapi.auth2.getAuthInstance().signIn();
  };
  const handleLogout = () => {
    gapi.auth2.getAuthInstance().signOut();
    setUser(null);
  };
    fetch(SHEET_URL)
      .then((res) => res.text())
      .then((csv) => {
        // Parse CSV to array
        const rows = csv.split('\n').map(row => row.split(','));
        setTableData(rows);
        setFormData(Array(rows[0]?.length || 0).fill(''));
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
      <div style={{ marginBottom: 16 }}>
        {isSignedIn ? (
          <>
            {user && (
              <span style={{ marginRight: 12 }}>
                <img src={user.imageUrl} alt="avatar" style={{ width: 28, height: 28, borderRadius: '50%', verticalAlign: 'middle', marginRight: 8 }} />
                Login sebagai: <b>{user.email}</b>
              </span>
            )}
            <button onClick={handleLogout} style={{ padding: '6px 16px', borderRadius: 4, background: '#e53935', color: '#fff', border: 'none', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <button onClick={handleLogin} style={{ padding: '6px 16px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', cursor: 'pointer' }}>Login dengan Google</button>
        )}
      </div>
      <p style={{ fontSize: '0.9em' }}>
        Data source: <a href={SHEET_URL} target="_blank" rel="noopener noreferrer">Google Sheets</a>
      </p>
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && tableData.length > 0 && (
        <>
          {/* Filter input */}
          <div style={{ margin: '16px 0', maxWidth: 400 }}>
            <input
              type="text"
              placeholder="Filter data..."
              value={filter}
              onChange={e => { setFilter(e.target.value); setShowRows(10); }}
              style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #bbb', fontSize: 16 }}
            />
          </div>
          <div style={{ overflowX: 'auto', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: 16 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 16 }}>
              <thead>
                <tr>
                  {tableData[0].map((cell, j) => (
                    <th key={j} style={{
                      border: '1px solid #bbb',
                      padding: 10,
                      background: '#f5f5f5',
                      fontWeight: 'bold',
                      textAlign: 'left',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1)
                  .filter(row =>
                    filter.trim() === '' ||
                    row.some(cell => cell.toLowerCase().includes(filter.toLowerCase()))
                  )
                  .slice(0, showRows)
                  .map((row, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fafbfc' : '#fff' }}>
                      {row.map((cell, j) => (
                        <td key={j} style={{ border: '1px solid #eee', padding: 10 }}>{cell}</td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
            {/* Pagination: show more rows */}
            {tableData.slice(1).filter(row =>
              filter.trim() === '' ||
              row.some(cell => cell.toLowerCase().includes(filter.toLowerCase()))
            ).length > showRows && (
              <button onClick={() => setShowRows(showRows + 10)} style={{ marginTop: 16, padding: '8px 24px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
                Tampilkan 10 data lagi
              </button>
            )}
          </div>
        </>
      )}
      {/* Add Row Form */}
      {!loading && !error && tableData.length > 0 && (
        <form
          style={{ marginTop: 32, background: '#f9f9f9', padding: 16, borderRadius: 8, boxShadow: '0 1px 4px #eee', maxWidth: 600, marginLeft: 'auto', marginRight: 'auto' }}
          onSubmit={e => {
            e.preventDefault();
            setSubmitMsg('Fitur tambah data akan aktif setelah integrasi Google Sheets API.');
          }}
        >
          <h3 style={{ marginBottom: 16 }}>Tambah Data</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {tableData[0].map((header, idx) => (
              <div key={idx} style={{ flex: '1 1 120px', minWidth: 120 }}>
                <label style={{ fontSize: 14, color: '#555' }}>{header}</label>
                <input
                  type="text"
                  value={formData[idx] || ''}
                  onChange={e => {
                    const newData = [...formData];
                    newData[idx] = e.target.value;
                    setFormData(newData);
                  }}
                  style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', marginTop: 4 }}
                />
              </div>
            ))}
          </div>
          <button type="submit" style={{ marginTop: 16, padding: '8px 24px', borderRadius: 4, background: '#1976d2', color: '#fff', border: 'none', fontWeight: 'bold', fontSize: 16, cursor: 'pointer' }}>
            Tambah
          </button>
          {submitMsg && <div style={{ marginTop: 12, color: '#1976d2', fontSize: 14 }}>{submitMsg}</div>}
        </form>
      )}
      <p style={{ marginTop: 32, fontSize: '0.8em', color: '#888' }}>
        To use a different sheet, edit <code>SHEET_URL</code> in <code>src/App.js</code>.
      </p>
    </div>
  );
}

export default App;
