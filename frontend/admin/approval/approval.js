document.addEventListener('DOMContentLoaded', () => {
    const usersUrl = "http://localhost:3002/Users";
    const membersUrl = "http://localhost:3002/Members";
    const paymentsUrl = "http://localhost:3002/Payments";
    const alertsUrl = "http://localhost:3002/Alerts";
    const trainingProgramActivitiesUrl = "http://localhost:3002/TrainingProgramActivities";
    let lastIdUrl = "http://localhost:3002/LastId";
    const approvalRequestsUrl = "http://localhost:3002/ApprovalRequests";
    const viewModal = document.getElementById('viewModal');
    const requestDetailsDiv = document.getElementById('requestDetails');
    let approvalRequests = [];
    let currentRequest = null; // Track the currently viewed request

    let payments = [];
    let alerts = [];
    let lastIds = [];
    let users = [];
    let members = [];
    let trainingProgramActivities = [];

    let contentTitle = document.getElementById('contentTitle');
    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Member Requests for Approval';

    const fetchData = async () => {
        try {
            const response = await fetch(usersUrl);
            users = await response.json();
            let loggedInUser = users.find((user) => user.MemberID === memberId);
            document.getElementById('adminName').innerHTML = capitalizeFirstLetter(loggedInUser.UserName);

            const activitiesResponse = await fetch(trainingProgramActivitiesUrl);
            trainingProgramActivities = await activitiesResponse.json();

            const membersResponse = await fetch(membersUrl);
            members = await membersResponse.json();

            const lastIdResponse = await fetch(lastIdUrl);
            lastIds = await lastIdResponse.json();

            const approvalResponse = await fetch(approvalRequestsUrl);
            approvalRequests = await approvalResponse.json();

            populateApprovalRequestsTable();
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    // Populate the table with approval requests
    const populateApprovalRequestsTable = () => {
        const tbody = document.querySelector('#approvalRequestsTable tbody');
        tbody.innerHTML = ''; // Clear existing rows

        approvalRequests.forEach((request) => {
            const row = document.createElement('tr');

            
            const idCell = document.createElement('td');
            idCell.textContent = request.id;
            row.appendChild(idCell);

            if (request.RequestType === "newMember") {
                const memberCell = document.createElement('td');
                memberCell.textContent = `New User - ${request.MemberDetails.UserName}`;
                row.appendChild(memberCell);
            } else {
                const member = members.find(member => member.id === request.MemberID);
                const memberCell = document.createElement('td');
                memberCell.textContent = `${request.MemberID} - ${member.UserName}`;
                row.appendChild(memberCell);
            }

            const typeCell = document.createElement('td');
            typeCell.textContent = request.RequestType;
            row.appendChild(typeCell);

            const actionCell = document.createElement('td');
            const viewButton = document.createElement('button');
            viewButton.textContent = 'View';
            viewButton.addEventListener('click', () => openModal(request));
            actionCell.appendChild(viewButton);
            row.appendChild(actionCell);

            tbody.appendChild(row);
        });
    };

    const openModal = (request) => {
        currentRequest = request; 
        requestDetailsDiv.innerHTML = '';

        Object.keys(request).forEach((key) => {
            const detail = document.createElement('p');
            detail.textContent = `${key}: ${JSON.stringify(request[key], null, 2)}`;
            requestDetailsDiv.appendChild(detail);
        });

        viewModal.style.display = 'block';
    };

    document.getElementById('acceptBtn').addEventListener('click', async () => {
        if (currentRequest) {
            switch (currentRequest.RequestType) {
                case 'payment':
                    await handlePaymentRequest(currentRequest);
                    break;
                default:
                    console.log('Other request type handling not implemented');
            }
            await updateRequestStatus(currentRequest, 'Accepted');
            viewModal.style.display = 'none'; 
        }
    });

    const handlePaymentRequest = async (request) => {
        const paidDateString = request.PaymentDetails.PaidDate;
        const paidDate = new Date(paidDateString);
        const dueDate = new Date();
        dueDate.setDate((paidDate.getDate()) + 30);

        const newPayment = {
            id: generateID("P", lastIds.PaymentID),
            MemberID: request.MemberID,
            PaymentType: "Monthly",
            Amount: request.PaymentDetails.Amount,
            PaidDate: paidDate.toISOString().split('T')[0],
            DueDate: dueDate.toISOString().split('T')[0],
            PaymentMethod: request.PaymentDetails.PaymentMethod
        };

        try {
            await fetch(paymentsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPayment),
            });

            lastIds.PaymentID++;
            await updateLastId(lastIds);
        } catch (error) {
            console.error('Error adding payment:', error);
        }

        await updateAlertStatus(request.MemberID);
        alert("The Payment Request was Accepted");
        
    };

    const updateAlertStatus = async (memberId) => {
        try {
            const response = await fetch(alertsUrl);
            const alerts = await response.json();

            const memberAlerts = alerts.filter(alert => alert.MemberID === memberId);
            if (memberAlerts.length > 0) {
                const lastAlert = memberAlerts.reduce((prev, current) => {
                    const prevIdNum = parseInt(prev.id.slice(2), 10);
                    const currentIdNum = parseInt(current.id.slice(2), 10);
                    return prevIdNum > currentIdNum ? prev : current;
                });

                lastAlert.Status = false;

                await fetch(`${alertsUrl}/${lastAlert.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(lastAlert),
                });
            }
        } catch (error) {
            console.error('Error updating alert status:', error);
        }
    };

    document.getElementById('rejectBtn').addEventListener('click', async () => {
        if (currentRequest) {
            await updateRequestStatus(currentRequest, 'Rejected');
            viewModal.style.display = 'none'; 
        }
    });

    document.getElementById('closeModal').addEventListener('click', () => {
        viewModal.style.display = 'none';
    });

    const updateRequestStatus = async (request, newStatus) => {
        try {
            const updatedRequest = { ...request, Status: newStatus };

            await fetch(`${approvalRequestsUrl}/${request.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedRequest),
            });
        } catch (error) {
            console.error('Error updating request status:', error);
        }
    };

    const generateID = (prefix, lastId) => {
        const number = lastId.toString().padStart(3, '0');
        return `${prefix}${number}`;
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

    fetchData();

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
        if (reportDropdown.style.display === "none" || reportDropdown.style.display === "") {
            reportDropdown.style.display = "flex";
            buttons.forEach(button => {
                button.classList.add('reportDropdownShow');
            });
        } else {
            reportDropdown.style.display = "none";
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = "../../login.html";
    });

    document.getElementById('dashboardBtn').addEventListener('click', () => {
        window.location.href = `../index.html?memberId=${memberId}`;
    });

    document.getElementById('membersBtn').addEventListener('click', () => {
        window.location.href = `../memberManagemnt/memberManage.html?memberId=${memberId}`;
    });

    document.getElementById('paymentBtn').addEventListener('click', () => {
        window.location.href = `../payment/payment.html?memberId=${memberId}`;
    });

    document.getElementById('userReportBtn').addEventListener('click', () => {
        window.location.href = `../memberReport/memberReport.html?memberId=${memberId}`;
    });

    document.getElementById('paymentReportBtn').addEventListener('click', () => {
        window.location.href = `../paymentReport/paymentReport.html?memberId=${memberId}`;
    });

    document.getElementById('programReportBtn').addEventListener('click', () => {
        window.location.href = `../trainingProgramReport/trainingProgramReport.html?memberId=${memberId}`;
    });

    document.getElementById('approvalRequestBtn').addEventListener('click', () => {
        window.location.href = `./approval.html?memberId=${memberId}`;
    });

    document.getElementById('enrollProgramBtn').addEventListener('click', () => {
        window.location.href = `../enrollProgram/enrollProgram.html?memberId=${memberId}`;
    });
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function capitalizeFirstLetter(string) {
    return string.split('_').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}
