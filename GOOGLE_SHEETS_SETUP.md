# Google Sheets Setup Instructions

Follow these steps to connect the poll to a Google Spreadsheet:

## Step 1: Create a Google Spreadsheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "Siemfest Poll Responses"
4. In the first row (A1, B1, C1, D1), add these headers:
   - **A1**: `Timestamp`
   - **B1**: `Name`
   - **C1**: `Vote`
   - **D1**: `Vote Label`

## Step 2: Create Google Apps Script

1. In your Google Spreadsheet, click **Extensions** → **Apps Script**
2. Delete any existing code in the editor
3. Copy and paste this code:

```javascript
function doPost(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Parse the JSON data from the POST request
    const data = JSON.parse(e.postData.contents);
    const name = data.name || '';
    const vote = data.vote || '';
    const timestamp = data.timestamp || new Date().toISOString();
    
    // Map vote values to readable labels
    const voteLabels = {
      'no-merch': 'Ik hoef geen merchandise!',
      'merch-single': 'Ja, merch, graag, vet!',
      'merch-family': 'Ja, merch voor mij, mijn partner en evt. kid(s)'
    };
    
    const voteLabel = voteLabels[vote] || vote;
    
    // Add the data to the spreadsheet
    sheet.appendRow([
      timestamp,
      name,
      vote,
      voteLabel
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Optional: Function to test the script
function test() {
  const testData = {
    name: 'Test User',
    vote: 'merch-single',
    timestamp: new Date().toISOString()
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  doPost(mockEvent);
}
```

4. Click **Save** (💾) and give your project a name like "Siemfest Poll Handler"

## Step 3: Deploy as Web App

1. Click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type" and choose **Web app**
3. Fill in the deployment settings:
   - **Description**: "Siemfest Poll Web App"
   - **Execute as**: "Me" (your email)
   - **Who has access**: "Anyone" (important!)
4. Click **Deploy**
5. **Authorize access** when prompted:
   - Click "Authorize access"
   - Choose your Google account
   - Click "Advanced" → "Go to [Project Name] (unsafe)" if you see a warning
   - Click "Allow"
6. **Copy the Web App URL** - it will look like:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```

## Step 4: Update Your Website

1. Open `script.js` in your project
2. Find this line near the top:
   ```javascript
   const GOOGLE_SCRIPT_URL = 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE';
   ```
3. Replace `'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE'` with your Web App URL (keep the quotes):
   ```javascript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby.../exec';
   ```
4. Save the file

## Step 5: Test It!

1. Open your website
2. Fill in a name and select a vote option
3. Check your Google Spreadsheet - you should see a new row with the data!

## Troubleshooting

- **"Poll is not configured yet"**: Make sure you've updated `GOOGLE_SCRIPT_URL` in `script.js`
- **No data appearing**: Check that "Who has access" is set to "Anyone" in the deployment settings
- **Permission errors**: Make sure you authorized the script when deploying
- **CORS errors**: The script uses `no-cors` mode, so you won't see response data, but votes should still be saved

## Security Note

Since the Web App is set to "Anyone", anyone with the URL can submit data. The script doesn't require authentication, which is fine for a simple poll, but be aware that malicious users could spam your spreadsheet. You can add rate limiting or authentication if needed later.
