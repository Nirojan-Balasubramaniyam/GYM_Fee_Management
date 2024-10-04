document.addEventListener('DOMContentLoaded', () => {
    const membersUrl = "http://localhost:3002/Members";
    const approvalRequestsUrl = "http://localhost:3002/ApprovalRequests";
    const lastIdUrl = "http://localhost:3002/LastId";

    let members = [];
    let approvalRequests = [];
    let lastIds = [];
    const memberId = getQueryParam('memberId');

    let contentTitle = document.getElementById('contentTitle');
    contentTitle.innerHTML = 'Change Member Information';

    const fetchMembers = async () => {
        const response = await fetch(membersUrl);
        members = await response.json();
        let loggedInUser = members.find((member) => member.id === memberId);
        console.log(loggedInUser)
        let userName = document.getElementById('username');
        userName.innerHTML = loggedInUser.FirstName + ' ' + loggedInUser.LastName;

        const member = members.find(member => member.id === memberId);
        if (member) {
            document.getElementById('firstName').value = member.FirstName;
            document.getElementById('lastName').value = member.LastName;
            document.getElementById('phone').value = member.Phone;
            document.getElementById('nic').value = member.NIC;

            fetchApprovals(); 
        }
    };

    const fetchApprovals = async () => {
        const response = await fetch(approvalRequestsUrl);
        approvalRequests = await response.json();

        document.getElementById('changeInfoButton').addEventListener('click', () => {
            fetchLastId();
        });
    };

    const fetchLastId = async () => {
        const response = await fetch(lastIdUrl);
        lastIds = await response.json();

        let lastApprovalId = lastIds.ApprovalRequestID;

        const generateID = () => {
            const prefix = "AR";
            const number = lastApprovalId.toString().padStart(3, '0');
            lastApprovalId++;
            lastIds.ApprovalRequestID = lastApprovalId;
            updateLastId(lastIds);
            return prefix + number;
        };

        const updateLastId = async (updatedLastIds) => {
            try {
                await fetch(`${lastIdUrl}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedLastIds)
                });
            } catch (error) {
                console.error("Error updating LastId:", error);
            }
        };

        const newApprovalRequest = {
            id: generateID(),
            RequestType: "memberInfoChange",
            MemberID: memberId,
            NewEnrollProgramIDDetails: {
                FirstName: document.getElementById('firstName').value,
                LastName: document.getElementById('lastName').value,
                Phone: document.getElementById('phone').value,
                NIC: document.getElementById('nic').value,
            },
            Status: "Pending"
        };

        const postResponse = await fetch(approvalRequestsUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newApprovalRequest)
        });

        alert('Your information change request has been sent to admin for approval!');
    };

    fetchMembers();

    const buttons = document.querySelectorAll('#navItems li a');
    const notificationBtn = document.querySelector('#notificationBtn');

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
        this.innerHTML = sidebar.classList.contains('minimized') ? '<i class="fa-solid fa-bars"></i>' : '&times;';
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
        window.location.href = `./changeInfo.html?memberId=${memberId}`;
    });
    document.getElementById('notificationBtn').addEventListener('click', () => {
        window.location.href = `../notification/notification.html?memberId=${memberId}`;
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = "../../login/login.html";
    });
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
