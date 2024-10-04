document.addEventListener('DOMContentLoaded', () => {
    const usersUrl = "http://localhost:3002/Users";
    let contentTitle = document.getElementById('contentTitle');
    const paymentsUrl = "http://localhost:3002/Payments";
    const alertsUrl = "http://localhost:3002/Alerts";
    const lastIdUrl = "http://localhost:3002/LastId";
    let payments = [];
    let alerts = [];
    let users = [];


    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Dash Board';
    const fetchUsers = async () => {
        const response = await fetch(usersUrl);
        users = await response.json();
        console.log(users);
        let loggedInUser = users.find((user) => user.MemberID === memberId);
        console.log(loggedInUser)
        let userName = document.getElementById('adminName');
        userName.innerHTML = capitalizeFirstLetter(loggedInUser.UserName);

    };
    fetchUsers();
    const fetchPayments = async () => {
        const response = await fetch(paymentsUrl);
        payments = await response.json();
        return payments;
    };

    const fetchAlerts = async () => {
        const response = await fetch(alertsUrl);
        alerts = await response.json();
        return alerts;
    };

    const displayTotalIncome = async () => {
        await fetchPayments();

        let totalIncome = 0;
        payments.forEach(payment => {
            if (payment.PaymentType === "Initial" || payment.PaymentType === "Monthly") {
                totalIncome += payment.Amount;
            }
        });

        const incomeDiv = document.getElementById("income");
        console.log(totalIncome)
        incomeDiv.innerHTML = `Total<br> Revenue<br><br><br>Rs${totalIncome}`;
    };

    const displayTotalOverdue = async () => {
        await fetchAlerts();

        let totalOverdue = 0;
        const notificationTable = document.getElementById("adminNotificationTable");
        alerts.forEach(alert => {
            if (alert.AlertType === "overdue" && alert.Status === true) {
                totalOverdue += alert.Amount;
                const row = document.createElement("tr");
                const overdueCell = document.createElement("td");
                overdueCell.textContent = `Member ID ${alert.MemberID} has overdue payment - Rs${alert.Amount} | Due Date - ${alert.DueDate}`;
                row.appendChild(overdueCell);
                notificationTable.appendChild(row);
            }
        });
        const overdueDiv = document.getElementById("overdue");
        overdueDiv.innerHTML = `Total<br> Overdue<br><br><br>Rs${totalOverdue}`;

        if (totalOverdue === 0) {
            const noNotificationRow = document.createElement("tr");
            const noNotificationCell = document.createElement("td");
            noNotificationCell.textContent = "You don't have any overdue notifications.";
            noNotificationCell.setAttribute("colspan", "3");
            noNotificationRow.appendChild(noNotificationCell);
            notificationTable.appendChild(noNotificationRow);
        }
    };

    displayTotalIncome();
    displayTotalOverdue();

    const fetchAlertsAndPayments = async () => {
        try {
            const alertsResponse = await fetch(alertsUrl);
            let alerts = await alertsResponse.json();

            const paymentsResponse = await fetch(paymentsUrl);
            let payments = await paymentsResponse.json();
            addNewAlerts(payments, alerts);

        } catch (error) {
            console.error("Error fetching alerts or payments:", error);
        }
    };

    async function addNewAlerts(payments, alerts) {
        const today = new Date();
        let lastIds = await fetchLastId();
        const monthlyPayments = payments.filter(payment => payment.PaymentType === "Monthly");
        const lastPayments = monthlyPayments.reduce((acc, payment) => {
            const memberId = payment.MemberID;
            if (!acc[memberId]) {
                acc[memberId] = [];
            }
            acc[memberId].push(payment);
            return acc;
        }, {});

        for (const memberId in lastPayments) {
            const memberPayments = lastPayments[memberId];
            memberPayments.sort((a, b) => {
                const paymentIdA = parseInt(a.id.substring(1), 10); // Remove first letter and convert to number
                const paymentIdB = parseInt(b.id.substring(1), 10); 
                return paymentIdB - paymentIdA; // Compare the numerical part to find the last payment
            });

            const lastPayment = memberPayments[0];

            const lastDueDate = new Date(lastPayment.DueDate);
            const daysBeforeDue = Math.ceil((lastDueDate  - today) / (1000 * 60 * 60 * 24)); 

            const existingOverdueAlert = alerts.find(alert => alert.MemberID === memberId && alert.AlertType === "overdue");
            if (lastDueDate < today && !existingOverdueAlert) {
                const overdueAlert = {
                    id: generateID("AT", lastIds.AlertID),
                    AlertType: "overdue",
                    Amount: lastPayment.Amount,
                    DueDate: lastPayment.DueDate,
                    MemberID: lastPayment.MemberID,
                    Status: true
                };
                await addAlert(overdueAlert);
                alerts.push(overdueAlert);
                lastIds.PaymentID++;
                await updateLastId(lastIds);
                console.log(`Overdue alert added for MemberID: ${lastPayment.MemberID}`);
            }
         
            const existingRenewalAlert = alerts.find(alert => alert.MemberID === memberId && alert.AlertType === "renewal");
            console.log(today)
            console.log(lastDueDate)
            console.log(daysBeforeDue)
            console.log(!existingOverdueAlert)
            console.log(lastDueDate > today)
            console.log(daysBeforeDue <= 5 && daysBeforeDue >= 0 && !existingRenewalAlert && lastDueDate > today)
            if (daysBeforeDue <= 5 && daysBeforeDue >= 0 && !existingRenewalAlert && lastDueDate > today) {
                const renewalAlert = {
                    id: generateID("AT", lastIds.AlertID),
                    AlertType: "renewal",
                    Amount: lastPayment.Amount,
                    DueDate: lastPayment.DueDate,
                    MemberID: lastPayment.MemberID,
                    Status: true
                };
                await addAlert(renewalAlert);
                alerts.push(renewalAlert);
                lastIds.PaymentID++;
                await updateLastId(lastIds);
                console.log(`Renewal alert added for MemberID: ${lastPayment.MemberID}`);
            }
        }
    }

    async function addAlert(alert) {
        try {
            const response = await fetch(alertsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(alert),
            });
            if (!response.ok) {
                throw new Error("Failed to add alert");
            }
        } catch (error) {
            console.error("Error adding alert:", error);
        }
    }

    const generateID = (prefix, lastId) => {
        const number = lastId.toString().padStart(3, '0');
        return `${prefix}${number}`;
    };
    const fetchLastId = async () => {
        const response = await fetch(lastIdUrl);
        return await response.json();
    };

    const updateLastId = async (updatedLastIds) => {
        await fetch(`${lastIdUrl}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedLastIds),
        });
    };
    fetchAlertsAndPayments();
    const buttons = document.querySelectorAll('#navItems li a');
    const reportButtons = document.querySelectorAll('#reportDropdown li a');
    console.log(buttons);
    resetButtons();
    function handleButtonClick(buttonGroup) {
        buttonGroup.forEach(button => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                resetButtons();
                button.classList.add('dark-green');
                button.classList.remove('light-green');
            });
        });
    }
    function resetButtons() {
        [...buttons, ...reportButtons].forEach(btn => {
            btn.classList.add('light-green');
            btn.classList.remove('dark-green');
        });
    }
    handleButtonClick(buttons);
    handleButtonClick(reportButtons);

    document.getElementById('toggleSidebar').addEventListener('click', function () {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('minimized');
        if (sidebar.classList.contains('minimized')) {
            this.innerHTML = '<i class="fa-solid fa-bars"></i>';
        } else {
            this.innerHTML = '&times';
        }
    });

    document.getElementById("reportBtn").addEventListener("click", function () {
        const reportDropdown = document.getElementById("reportDropdown");
        const buttons = document.querySelectorAll('#reportDropdown li a');
        if (
            reportDropdown.style.display === "none" ||
            reportDropdown.style.display === ""
        ) {
            reportDropdown.style.display = "flex";
            buttons.forEach(button => {
                button.classList.add('reportDropdownShow');
            });
        } else {
            reportDropdown.style.display = "none";
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = "../login/login.html"

    });
    document.getElementById('dashboardBtn').addEventListener('click', () => {
        window.location.href = `./index.html?memberId=${memberId}`
    });
    document.getElementById('membersBtn').addEventListener('click', () => {
        window.location.href = `./memberManagemnt/memberManage.html?memberId=${memberId}`
    });
    document.getElementById('paymentBtn').addEventListener('click', () => {
        window.location.href = `./payment/payment.html?memberId=${memberId}`
    });
    document.getElementById('userReportBtn').addEventListener('click', () => {
        window.location.href = `./memberReport/memberReport.html?memberId=${memberId}`
    });
    document.getElementById('paymentReportBtn').addEventListener('click', () => {
        window.location.href = `./paymentReport/paymentReport.html?memberId=${memberId}`
    });
    document.getElementById('programReportBtn').addEventListener('click', () => {
        window.location.href = `./trainingProgramReport/trainingProgramReport.html?memberId=${memberId}`
    });
    document.getElementById('approvalRequestBtn').addEventListener('click', () => {
        window.location.href = `./approval/approval.html?memberId=${memberId}`
    });
    document.getElementById('enrollProgramBtn').addEventListener('click', () => {
        window.location.href = `./enrollProgram/enrollProgram.html?memberId=${memberId}`
    });


})

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
function capitalizeFirstLetter(string) {
    return string.split('_').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}































