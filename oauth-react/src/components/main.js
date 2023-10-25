import React, { useState } from 'react';

function OAuth2Integration() {
  const [accessToken, setAccessToken] = useState('');
  const [clientId, setClientId] = useState(''); // Initialize with your client ID
  const [clientSecret, setClientSecret] = useState(''); // Initialize with your client secret
  const [environment, setEnvironment] = useState('sandbox'); // or 'production'
  const [redirectUri, setRedirectUri] = useState(''); // Initialize with your redirect URI

  // For Company Info
  const [companyInfo, setCompanyInfo] = useState({});
  const [loading, setLoading] = useState(false);

  // For invoice
  const [customerRef, setCustomerRef] = useState(''); // Set this to the customer reference
  const [lineItems, setLineItems] = useState([]); // An array of line items
  const [newLineItem, setNewLineItem] = useState({
    description: '',
    quantity: 1,
    rate: 0,
  });

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

  const handleAddLineItem = () => {
    // Add the new line item to the lineItems array
    setLineItems([...lineItems, newLineItem]);
    // Clear the newLineItem state for the next entry
    setNewLineItem({
      description: '',
      quantity: 1,
      rate: 0,
    });
  };

  const handleRemoveLineItem = (index) => {
    // Remove a line item by its index
    const updatedLineItems = [...lineItems];
    updatedLineItems.splice(index, 1);
    setLineItems(updatedLineItems);
  };

  const handleCreateInvoice = () => {
    // Construct the invoice data with customer reference and line items
    const invoiceData = {
      CustomerRef: {
        value: customerRef, // Customer reference ID
        name: 'Customer Name', // Customer name
      },
      Line: lineItems, // Array of line items
      CurrencyRef: {
        value: 'USD', // Currency code
      },
      // Add other fields as needed
    };

    // Log the invoice data before sending it to the server
    console.log('Invoice Data:', invoiceData);

    // Send a POST request to the server to create the invoice
    fetch('/createInvoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invoiceData),
    })
      .then((response) => response.json())
      .then((createdInvoice) => {
        console.log('Invoice created:', createdInvoice);
        // Handle the created invoice on the client-side as needed
      })
      .catch((error) => {
        console.error('Error creating invoice:', error);
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
      <div>
      <h1>Create Invoice</h1>
      <label>
        Customer Reference:
        <input
          type="text"
          value={customerRef}
          onChange={(e) => setCustomerRef(e.target.value)}
        />
      </label>
      <div>
        <h3>Line Items</h3>
        {lineItems.map((item, index) => (
          <div key={index}>
            <p>{item.description} - Quantity: {item.quantity} - Rate: ${item.rate}</p>
            <button onClick={() => handleRemoveLineItem(index)}>Remove</button>
          </div>
        ))}
        <label>
          Description:
          <input
            type="text"
            value={newLineItem.description}
            onChange={(e) => setNewLineItem({ ...newLineItem, description: e.target.value })}
          />
        </label>
        <label>
          Quantity:
          <input
            type="number"
            value={newLineItem.quantity}
            onChange={(e) => setNewLineItem({ ...newLineItem, quantity: parseInt(e.target.value) })}
          />
        </label>
        <label>
          Rate:
          <input
            type="number"
            value={newLineItem.rate}
            onChange={(e) => setNewLineItem({ ...newLineItem, rate: parseFloat(e.target.value) })}
          />
        </label>
        <button onClick={handleAddLineItem}>Add Line Item</button>
      </div>
      <button onClick={handleCreateInvoice}>Create Invoice</button>
    </div>
    </div>
    
  );
}

export default OAuth2Integration;
