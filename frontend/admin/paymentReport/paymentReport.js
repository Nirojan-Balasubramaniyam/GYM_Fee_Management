document.addEventListener('DOMContentLoaded', () => {
    const usersUrl = "http://localhost:3002/Users";
    const paymentsUrl = "http://localhost:3002/Payments";
    const alertsUrl = "http://localhost:3002/Alerts";
    const membersUrl = 'http://localhost:3002/Members';
    let members = [];
    let payments = [];
    let alerts = [];
    let users = [];
    let contentTitle = document.getElementById('contentTitle');

    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Payment Report';
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
 
    const fetchPaymentsData = async () => {
        const membersResponse = await fetch(membersUrl);
        members = await membersResponse.json();

        const paymentsResponse = await fetch(paymentsUrl);
        payments = await paymentsResponse.json();

        displayAllReports(); 
    };

    const displayAllReports = () => {
        displayIncomeReport();
        displayOverdueReport();
        displayInitialPaymentReport();
        calculateTotals();
    };

    document.getElementById('search-button').addEventListener('click', () => {
        const searchValue = document.getElementById('search-input').value.toLowerCase();
        const foundMember = members.find(member =>
            member.id.toLowerCase() === searchValue || member.NIC.toLowerCase() === searchValue
        );
        if (foundMember) {
            displayIncomeReport(foundMember.id);
            displayOverdueReport(foundMember.id);
            displayInitialPaymentReport(foundMember.id);
            calculateTotals();
        } else {
            alert('Member not found.');
        }
    });

    document.getElementById('view-all-button').addEventListener('click', () => {
        displayAllReports();
        calculateTotals();
    });

    const displayIncomeReport = (filterMemberId = null) => {
        const tbody = document.querySelector('#revenue-report-table tbody');
        tbody.innerHTML = '';

        let filteredPayments = payments.filter(payment => payment.PaymentType === 'Monthly');
        if (filterMemberId) {
            filteredPayments = filteredPayments.filter(payment => payment.MemberID === filterMemberId);
        }

        filteredPayments.forEach(payment => {
            const member = members.find(member => member.id === payment.MemberID);
            if (member) {
                const row = `
                    <tr>
                        <td>${member.FirstName} ${member.LastName}</td>
                        <td>${member.id}</td>
                        <td>Rs ${payment.Amount}</td>
                        <td>${payment.PaidDate}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            }
        });
    };

    const displayOverdueReport = (filterMemberId = null) => {
        const tbody = document.querySelector('#overdue-report-table tbody');
        tbody.innerHTML = '';

        let filteredPayments = payments.filter(payment => new Date(payment.DueDate) < new Date() && payment.DueDate);
        if (filterMemberId) {
            filteredPayments = filteredPayments.filter(payment => payment.MemberID === filterMemberId);
        }

        filteredPayments.forEach(payment => {
            const member = members.find(member => member.id === payment.MemberID);
            if (member) {
                const row = `
                    <tr>
                        <td>${member.FirstName} ${member.LastName}</td>
                        <td>${member.id}</td>
                        <td>Rs ${payment.Amount}</td>
                        <td>${payment.DueDate}</td>
                        <td>${member.Phone}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            }
        });
    };

    const displayInitialPaymentReport = (filterMemberId = null) => {
        const tbody = document.querySelector('#initial-payment-report-table tbody');
        tbody.innerHTML = '';

        let filteredPayments = payments.filter(payment => payment.PaymentType === 'Initial');
        if (filterMemberId) {
            filteredPayments = filteredPayments.filter(payment => payment.MemberID === filterMemberId);
        }

        filteredPayments.forEach(payment => {
            const member = members.find(member => member.id === payment.MemberID);
            if (member) {
                const row = `
                    <tr>
                        <td>${member.FirstName} ${member.LastName}</td>
                        <td>${member.id}</td>
                        <td>Rs ${payment.Amount}</td>
                        <td>${payment.PaidDate}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            }
        });
    };

    const calculateTotals = () => {
        const totalIncome = payments
            .filter(payment => payment.PaymentType === 'Monthly')
            .reduce((sum, payment) => sum + payment.Amount, 0);

        const totalOverdue = payments
            .filter(payment => new Date(payment.DueDate) < new Date() && payment.DueDate)
            .reduce((sum, payment) => sum + payment.Amount, 0);

        const totalInitialPayment = payments
            .filter(payment => payment.PaymentType === 'Initial')
            .reduce((sum, payment) => sum + payment.Amount, 0);

        document.getElementById('total-income').textContent = `Total Income: Rs${totalIncome.toFixed(2)}`;
        document.getElementById('total-overdue').textContent = `Total Overdue: Rs${totalOverdue.toFixed(2)}`;
        document.getElementById('total-initial-payment').textContent = `Total Initial Payment: Rs${totalInitialPayment.toFixed(2)}`;
    };

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    fetchPaymentsData(); 


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
        window.location.href = "../../login.html"
    });
    document.getElementById('dashboardBtn').addEventListener('click', () => {
        window.location.href = `../index.html?memberId=${memberId}`
    });
    document.getElementById('membersBtn').addEventListener('click', () => {
        window.location.href = `../memberManagemnt/memberManage.html?memberId=${memberId}`
    });
    document.getElementById('paymentBtn').addEventListener('click', () => {
        window.location.href = `../payment/payment.html?memberId=${memberId}`
    });
    document.getElementById('userReportBtn').addEventListener('click', () => {
        window.location.href = `../memberReport/memberReport.html?memberId=${memberId}`
    });
    document.getElementById('paymentReportBtn').addEventListener('click', () => {
        window.location.href = `./paymentReport.html?memberId=${memberId}`
    });
    document.getElementById('programReportBtn').addEventListener('click', () => {
        window.location.href = `../trainingProgramReport/trainingProgramReport.html?memberId=${memberId}`
    });
    document.getElementById('approvalRequestBtn').addEventListener('click', () => {
        window.location.href = `../approval/approval.html?memberId=${memberId}`
    });
    document.getElementById('enrollProgramBtn').addEventListener('click', () => {
        window.location.href = `../enrollProgram/enrollProgram.html?memberId=${memberId}`
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