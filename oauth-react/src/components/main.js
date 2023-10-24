import React, { useState } from 'react';

function OAuth2Integration() {
  const [accessToken, setAccessToken] = useState('');
  const [clientId, setClientId] = useState(''); // Initialize with your client ID
  const [clientSecret, setClientSecret] = useState(''); // Initialize with your client secret
  const [environment, setEnvironment] = useState('sandbox'); // or 'production'
  const [redirectUri, setRedirectUri] = useState(''); // Initialize with your redirect URI

  const handleConnectToQuickBooks = () => {
    // Fetch the authorization URL from your Express backend
    fetch('http://localhost:8000/authUri', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
        environment,
        redirectUri,
      }),
    })
      .then((response) => response.text()) // Read the response as text
      .then((authUri) => {
        console.log(authUri)
        // Open the authorization URL in a new tab or window
        window.open(authUri);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };
  
  const handleRetrieveToken = () => {
    // Fetch the access token from your Express backend
    fetch('http://localhost:8000/retrieveToken', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((token) => {
        setAccessToken(token);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const handleRefreshToken = () => {
    // Refresh the access token
    fetch('http://localhost:8000/refreshAccessToken', {
      method: 'GET',
    })
      .then((response) => response.json())
      .then((token) => {
        setAccessToken(token);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <h1>intuit-nodejsclient sample application</h1>
      <div>
        <label>
          Client ID:
          <input
            type="text"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
        </label>
        <label>
          Client Secret:
          <input
            type="text"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
          />
        </label>
        <label>
          Environment:
          <select value={environment} onChange={(e) => setEnvironment(e.target.value)}>
            <option value="sandbox">Sandbox</option>
            <option value="production">Production</option>
          </select>
        </label>
        <label>
          Redirect URI:
          <input
            type="text"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
          />
        </label>
      </div>
      <button onClick={handleConnectToQuickBooks}>Connect to QuickBooks</button>
      <button onClick={handleRetrieveToken}>Display Access Token</button>
      <button onClick={handleRefreshToken}>Refresh Token</button>
      <pre>Access Token: {accessToken}</pre>
    </div>
  );
}

export default OAuth2Integration;
