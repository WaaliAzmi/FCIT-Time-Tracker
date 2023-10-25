import React, { useState } from 'react';
import axios from 'axios'
function OAuth2Integration() {
  const [accessToken, setAccessToken] = useState('');
  const [clientId, setClientId] = useState(''); // Initialize with your client ID
  const [clientSecret, setClientSecret] = useState(''); // Initialize with your client secret
  const [environment, setEnvironment] = useState('sandbox'); // or 'production'
  const [redirectUri, setRedirectUri] = useState(''); // Initialize with your redirect URI

  // For Company Info
  const [companyInfo, setCompanyInfo] = useState({});
  const [loading, setLoading] = useState(false);

// For employee
const [employeeInfo, setEmployeeInfo] = useState([]);

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
        console.log(authUri);
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
        // Set the 'access_token' property as the access token
        setAccessToken(token.access_token);
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
        // Set the 'access_token' property as the access token
        setAccessToken(token.access_token);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };

  const fetchCompanyInfo = () => {
    // Set loading to true while fetching data
    setLoading(true);

    // Fetch the company data from your Express backend
    fetch('http://localhost:8000/getCompanyInfo', {
      method: 'GET',
    })
    .then((response) => {
        console.log(response); // Log the response here to see the raw response
        return response.json();
    })
    .then((data) => {
        // Check if 'CompanyInfo' is in the data
        if (data.CompanyInfo) {
            // Set the 'companyInfo' state and mark loading as false
            setCompanyInfo(data.CompanyInfo);
        } else {
            console.error('No "CompanyInfo" found in the response data.');
        }
        setLoading(false);
    })
    .catch((error) => {
        console.error('Error:', error);
        // Mark loading as false even in case of an error
        setLoading(false);
    });
  };

  const createEmployee = () => {
    // Define the employee data
    const employeeData = {
      "GivenName": "Abc",
      "SSN": "444-55-6666",
      "PrimaryAddr": {
        "CountrySubDivisionCode": "CA",
        "City": "Middlefield",
        "PostalCode": "93242",
        "Id": "50",
        "Line1": "45 N. Elm Street"
      },
      "PrimaryPhone": {
        "FreeFormNumber": "408-525-1234"
      },
      "FamilyName": "Xyz"
    };
  
    // Send a POST request to the server to create the employee
    fetch('http://localhost:8000/createEmployee', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(employeeData), // Send the corrected employeeData as JSON
    })
      .then((response) => response.json())
      .then((createdEmployee) => {
        console.log('Employee created:', createdEmployee);
        // Handle the created employee on the client-side as needed
      })
      .catch((error) => {
        console.error('Error creating employee:', error);
      });
  };
  
  const fetchEmployee = async() => {
    // Set loading to true while fetching data
    setLoading(true);
    try {
      
      let resp = await axios.get('http://localhost:8000/getEmployee')
      setEmployeeInfo(resp?.data?.QueryResponse?.Employee)
      console.log(resp.data.QueryResponse.Employee)
      console.log(employeeInfo)
      setLoading(false)

    } catch (error) {
      console.error('Error:', error);
      // Mark loading as false even in case of an error
      setLoading(false);
    }
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
      <hr />
      <div>
        <h1>Company Information</h1>
        <button onClick={fetchCompanyInfo}>Fetch Company Info</button>
        {loading ? (
          <p>Loading company information...</p>
        ) : (
          <pre>Company Info: {JSON.stringify(companyInfo)}</pre>
        )}
      </div>
      <hr/>
    <hr/>
    <button onClick={createEmployee}>Create Employee</button>
    <div>
        <h1>Employee Information</h1>
        <button onClick={fetchEmployee}>Fetch Employee Info</button>
        {loading ? (
          <p>Loading employee information...</p>
        ) : (
          <pre>Employee Info: {employeeInfo.map((data)=>{
           return <pre>{JSON.stringify(data)}</pre>
          })} </pre>
        )}
      </div>
    </div>
    
  );
}

export default OAuth2Integration;
