document.addEventListener('DOMContentLoaded', () => {
    const membersUrl = "http://localhost:3002/Members";
    const PaymentsUrl = "http://localhost:3002/Payments";
    let payments = [];
    let members = [];
    let contentTitle = document.getElementById('contentTitle');

    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Payment History';

    const fetchMembers = async () => {
        const response = await fetch(membersUrl);
        members = await response.json();
        let loggedInUser = members.find((member) => member.id === memberId);
        console.log(loggedInUser)
        let userName = document.getElementById('username');
        userName.innerHTML = loggedInUser.FirstName + ' ' + loggedInUser.LastName;
        const fetchPayments = async () => {
            const response = await fetch(PaymentsUrl);
            payments = await response.json();
            function displayPaymentHistory() {
                const paymentTableBody = document.getElementById('paymentTableBody');
                paymentTableBody.innerHTML = '';

                const memberPayments = payments.filter(payment => payment.MemberID === memberId);
                if (memberPayments.length === 0) {
                    const noPaymentRow = document.createElement('tr');
                    const noPaymentCell = document.createElement('td');
                    noPaymentCell.setAttribute('colspan', 4);
                    noPaymentCell.textContent = "No payment history available.";
                    noPaymentRow.appendChild(noPaymentCell);
                    paymentTableBody.appendChild(noPaymentRow);
                    return;
                }

                memberPayments.forEach(payment => {
                    const row = document.createElement('tr');
                    row.classList.add('payment-table-row');
                    row.innerHTML = `
                    <td>${payment.PaymentType}</td>
                    <td>${payment.Amount}</td>
                    <td>${payment.PaidDate}</td>
                    <td>${payment.DueDate ? payment.DueDate : 'N/A'}</td>
                `;
                    paymentTableBody.appendChild(row);
                });
            }
            displayPaymentHistory();
        };
        fetchPayments();
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
        window.location.href = `./paymentHistory.html?memberId=${memberId}`;
    });
    document.getElementById('userInfoBtn').addEventListener('click', () => {
        window.location.href = `../index.html?memberId=${memberId}`;
    });
    document.getElementById('changeInfoBtn').addEventListener('click', () => {
        window.location.href = `../changeInfo/changeInfo.html?memberId=${memberId}`;
    });
    document.getElementById('notificationBtn').addEventListener('click', () => {
        window.location.href = `../notification/notification.html?memberId=${memberId}`;
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = "../../login/login.html";
    });

})

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}