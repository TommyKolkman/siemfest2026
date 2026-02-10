// script

// Simple poll functionality with Google Sheets integration
(function() {
    // ⚠️ IMPORTANT: Replace this with your Google Apps Script Web App URL
    // You'll get this URL after deploying your Google Apps Script (see SETUP_INSTRUCTIONS.md)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx2tOn2aQaAzwbv59vSP2oPJqq6zzKHT7e1xlbN9vZDwn_OI86dYWaVOQpqh4gQm2CU/exec';
    
    // Initialize poll data (for display only - actual data comes from spreadsheet)
    let pollData = {
        'no-merch': 0,
        'merch-single': 0,
        'merch-family': 0
    };
    
    // Get elements
    const nameInput = document.getElementById('poll-name');
    const radioButtons = document.querySelectorAll('input[name="donation"]');
    const submitButton = document.getElementById('poll-submit-btn');
    const resultsDiv = document.getElementById('poll-results');
    const barNoMerch = document.getElementById('bar-no-merch');
    const barMerchSingle = document.getElementById('bar-merch-single');
    const barMerchFamily = document.getElementById('bar-merch-family');
    const countNoMerch = document.getElementById('count-no-merch');
    const countMerchSingle = document.getElementById('count-merch-single');
    const countMerchFamily = document.getElementById('count-merch-family');
    const pollTotal = document.getElementById('poll-total');
    
    // Update results display
    function updateResults() {
        const total = pollData['no-merch'] + pollData['merch-single'] + pollData['merch-family'];
        
        if (total > 0) {
            resultsDiv.style.display = 'block';
            
            const noMerchPercent = total > 0 ? (pollData['no-merch'] / total) * 100 : 0;
            const merchSinglePercent = total > 0 ? (pollData['merch-single'] / total) * 100 : 0;
            const merchFamilyPercent = total > 0 ? (pollData['merch-family'] / total) * 100 : 0;
            
            barNoMerch.style.width = noMerchPercent + '%';
            barMerchSingle.style.width = merchSinglePercent + '%';
            barMerchFamily.style.width = merchFamilyPercent + '%';
            
            countNoMerch.textContent = pollData['no-merch'];
            countMerchSingle.textContent = pollData['merch-single'];
            countMerchFamily.textContent = pollData['merch-family'];
            pollTotal.textContent = total;
        } else {
            resultsDiv.style.display = 'none';
        }
    }
    
    // Send vote to Google Sheets
    async function sendVoteToSheets(name, vote) {
        if (GOOGLE_SCRIPT_URL === 'YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE') {
            console.error('Google Script URL not configured. Please set GOOGLE_SCRIPT_URL in script.js');
            alert('Poll is not configured yet. Please contact the administrator.');
            return false;
        }
        
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name.trim(),
                    vote: vote,
                    timestamp: new Date().toISOString()
                })
            });
            
            // With no-cors mode, we can't read the response, but the data is sent
            return true;
        } catch (error) {
            console.error('Error sending vote to Google Sheets:', error);
            alert('Er ging iets mis bij het versturen van je stem. Probeer het opnieuw.');
            return false;
        }
    }
    
    // Handle submit button click
    submitButton.addEventListener('click', async function() {
        // Check if name is filled
        if (!nameInput.value || nameInput.value.trim() === '') {
            nameInput.focus();
            nameInput.setCustomValidity('Vul je naam in om te stemmen');
            nameInput.reportValidity();
            return;
        }
        
        // Check if a vote option is selected
        const selectedVote = document.querySelector('input[name="donation"]:checked');
        if (!selectedVote) {
            alert('Selecteer een optie om te stemmen.');
            return;
        }
        
        nameInput.setCustomValidity('');
        const vote = selectedVote.value;
        const name = nameInput.value.trim();
        
        // Disable button while submitting
        submitButton.disabled = true;
        submitButton.textContent = 'Versturen...';
        
        // Send to Google Sheets
        const success = await sendVoteToSheets(name, vote);
        
        if (success) {
            // Update local display (increment count)
            pollData[vote]++;
            updateResults();
            
            // Show success message
            alert('Bedankt! Je stem is opgeslagen.');
            
            // Disable the form after voting
            radioButtons.forEach(rb => rb.disabled = true);
            nameInput.disabled = true;
            submitButton.disabled = true;
            submitButton.textContent = 'Stem verstuurd ✓';
        } else {
            // Re-enable button if sending failed
            submitButton.disabled = false;
            submitButton.textContent = 'Stem versturen';
        }
    });
    
    // Validate name on input
    nameInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            this.setCustomValidity('');
        }
    });
    
    // Initial display
    updateResults();
})();
