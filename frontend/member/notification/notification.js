document.addEventListener('DOMContentLoaded', () => {
    const membersUrl = "http://localhost:3002/Members";
    const alertsUrl = "http://localhost:3002/Alerts";
    let alerts = [];
    let members = [];

    let contentTitle = document.getElementById('contentTitle');
    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Notifications';
    console.log(memberId);

    const fetchMembers = async () => {
        const response = await fetch(membersUrl);
        members = await response.json();
        let loggedInUser = members.find((member) => member.id === memberId);
        console.log(loggedInUser)
        let userName = document.getElementById('username');
        userName.innerHTML = loggedInUser.FirstName + ' ' + loggedInUser.LastName;
        const fetchAlerts = async () => {
            const response = await fetch(alertsUrl);
            alerts = await response.json();
            function displayNotification() {
                const notificationTableBody = document.getElementById('notificationTableBody');
                notificationTableBody.innerHTML = '';

                const memberAlerts = alerts.filter(alert => alert.MemberID === memberId);
                if (memberAlerts.length === 0) {
                    const noNotificationtRow = document.createElement('tr');
                    const noNotificationtCell = document.createElement('td');
                    noNotificationtCell.setAttribute('colspan', 4);
                    noNotificationtCell.textContent = "You don't have any notifications";
                    noNotificationtRow.appendChild(noNotificationtCell);
                    notificationTableBody.appendChild(noNotificationtRow);
                    return;
                }

                memberAlerts.forEach(alert => {
                    if (alert.Status) {


                        const row = document.createElement('tr');
                        row.classList.add('notification-table-row');
                        row.innerHTML = `<td>You have the ${alert.AlertType} alert of ${alert.Amount} Rs | Due Date is ${alert.DueDate} </td> `;
                        notificationTableBody.appendChild(row);
                    }
                });
            }
            displayNotification();
        };
        fetchAlerts();
    };
    fetchMembers();
    const buttons = document.querySelectorAll('#navItems li a');
    const notificationBtn = document.querySelector('#notificationBtn');
    console.log(buttons);
    resetButtons();

    notificationBtn.addEventListener('click', () => {
        notificationBtn.classList.add('notification-clicked');
        notificationBtn.classList.remove('notification-non-clicked');
    });

    buttons.forEach(button => {
        button.addEventListener('click', () => {
            resetButtons();
            button.classList.add('dark-green');
            button.classList.remove('light-green');
        });
    });

    function resetButtons() {
        notificationBtn.classList.add('notification-non-clicked');
        notificationBtn.classList.remove('notification-clicked');
        buttons.forEach(btn => {
            btn.classList.add('light-green');
            btn.classList.remove('dark-green');
        });
    }

    document.getElementById('toggleSidebar').addEventListener('click', function () {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('minimized');
        if (sidebar.classList.contains('minimized')) {
            this.innerHTML = '<i class="fa-solid fa-bars"></i>';
        } else {
            this.innerHTML = '&times';
        }
    });

    document.getElementById('bmiBtn').addEventListener('click', () => {
        window.location.href = `../bmi/bmi.html?memberId=${memberId}`;
    });
    document.getElementById('paymentBtn').addEventListener('click', () => {
        window.location.href = `../payment/payment.html?memberId=${memberId}`;
    });
    document.getElementById('changeProgramsBtn').addEventListener('click', () => {
        window.location.href = `../changeProgram/changeProgram.html?memberId=${memberId}`;
    });
    document.getElementById('paymentHistoryBtn').addEventListener('click', () => {
        window.location.href = `../paymentHistory/paymentHistory.html?memberId=${memberId}`;
    });
    document.getElementById('userInfoBtn').addEventListener('click', () => {
        window.location.href = `../index.html?memberId=${memberId}`;
    });
    document.getElementById('changeInfoBtn').addEventListener('click', () => {
        window.location.href = `../changeInfo/changeInfo.html?memberId=${memberId}`;
    });
    document.getElementById('notificationBtn').addEventListener('click', () => {
        window.location.href = `./notification.html?memberId=${memberId}`;
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = "../../login/login.html";
    });

})

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}






