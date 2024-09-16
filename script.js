document.getElementById('calculate-btn').addEventListener('click', calculateLoan);

function calculateLoan() {
    // Retrieve input values
    let loanAmount = parseFloat(document.getElementById('loan-amount').value);
    let numPayments = parseInt(document.getElementById('num-payments').value);
    let annualInterestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    let balloonPercentage = parseFloat(document.getElementById('balloon-amount').value) / 100;
    let paymentType = document.getElementById('payment-type').value;

    if (isNaN(loanAmount) || isNaN(numPayments) || isNaN(annualInterestRate) || isNaN(balloonPercentage)) {
        alert("Please fill out all fields correctly.");
        return;
    }

    // Balloon Payment Calculation
    let balloonAmount = loanAmount * balloonPercentage;
    let principal = loanAmount - balloonAmount;
    let monthlyRate = annualInterestRate / 12;

    let adjustment = paymentType === 'advance' ? -1 : 0;
    let adjustedNumPayments = numPayments + adjustment;

    let monthlyPayment = (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -adjustedNumPayments));
    let totalPayment = (monthlyPayment * adjustedNumPayments) + balloonAmount;
    let totalInterest = totalPayment - loanAmount;

    // Display results
    document.getElementById('monthly-payment').innerText = monthlyPayment.toFixed(2);
    document.getElementById('total-interest').innerText = totalInterest.toFixed(2);
    document.getElementById('balloon-result').innerText = balloonAmount.toFixed(2);
    document.getElementById('results').classList.remove('hidden');

    // Create Amortization Data for Chart
    let amortData = [];
    let balance = principal;
    let paymentNumber = paymentType === 'advance' ? 0 : 1;

    for (let i = 0; i < numPayments; i++) {
        let interestPayment = balance * monthlyRate;
        let principalPayment = monthlyPayment - interestPayment;
        if (paymentType === 'advance' && i === 0) {
            interestPayment = 0;
            principalPayment = monthlyPayment;
        }
        balance -= principalPayment;
        amortData.push({
            month: paymentNumber++,
            principal: principalPayment,
            interest: interestPayment,
            balance: Math.abs(balance)
        });
    }

    if (balloonAmount > 0) {
        amortData.push({
            month: paymentNumber,
            principal: balloonAmount,
            interest: 0,
            balance: 0
        });
    }

    generateChart(amortData);
}

function generateChart(data) {
    let ctx = document.getElementById('amortizationChart').getContext('2d');

    let labels = data.map(item => 'Month ' + item.month);
    let principalData = data.map(item => item.principal);
    let interestData = data.map(item => item.interest);

    if (window.amortChart) {
        window.amortChart.destroy();
    }

    window.amortChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Principal',
                    data: principalData,
                    backgroundColor: '#fff',
                    stack: 'Stack 0'
                },
                {
                    label: 'Interest',
                    data: interestData,
                    backgroundColor: '#f7b733',
                    stack: 'Stack 0'
                }
            ]
        },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'Amortization Schedule'
            },
            tooltips: {
                mode: 'index',
                intersect: false
            },
            scales: {
                x: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Payment Month'
                    }
                },
                y: {
                    stacked: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                }
            }
        }
    });
}
