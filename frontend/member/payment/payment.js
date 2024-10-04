document.addEventListener('DOMContentLoaded', () => {
    const membersUrl = "http://localhost:3002/Members";
    const trainingProgramActivitiesUrl = "http://localhost:3002/TrainingProgramActivities";    
    const approvalRequestsUrl = "http://localhost:3002/ApprovalRequests";
    let lastIdUrl = "http://localhost:3002/LastId"; 
    const enrolledTrainingProgramsUrl = "http://localhost:3002/EnrolledTrainingPrograms";
    let approvalRequests = [];
    let lastIds = [];
    let members = [];
    let trainingProgramActivities = [];
    let enrolledPrograms = [];
    let contentTitle = document.getElementById('contentTitle');


    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Make Payment';

    const fetchData = async () => {
        const response = await fetch(membersUrl);
        members = await response.json();
        console.log(memberId)
        console.log(members);
        let loggedInUser = members.find((member) => member.id === memberId);
        console.log(loggedInUser)
        let userName = document.getElementById('username');
        userName.innerHTML = loggedInUser.FirstName + ' ' + loggedInUser.LastName;

        const activitiesResponse = await fetch(trainingProgramActivitiesUrl);
        trainingProgramActivities = await activitiesResponse.json();

        const enrollProgramResponse = await fetch(enrolledTrainingProgramsUrl);
        enrolledPrograms = await enrollProgramResponse.json();
    console.log(enrolledPrograms)

    const memberPrograms = enrolledPrograms.filter(program => program.MemberID === memberId);
    console.log(memberPrograms)
    const totalPayment = memberPrograms.reduce((total, program) => {
        const activity = trainingProgramActivities.find(activity => activity.ActivittID === program.ActivittID);
        return total + (activity ? activity.Cost : 0);
    }, 0);

    document.getElementById('amount').value = totalPayment;

    document.getElementById('paymentForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const memberId = Number(getQueryParam('memberId'));
        console.log(memberId);

        const fetchApprovals = async () => {
            const response = await fetch(approvalRequestsUrl);
            approvalRequests = await response.json();
            console.log(approvalRequestsUrl);
            
            const amount = totalPayment;
            const receiptNumber = document.getElementById('receiptNumber').value.trim();
            const receiptFile = document.getElementById('receiptUpload').files[0];
            const fetchlastId = async () => {
                const response = await fetch(lastIdUrl);
                lastIds = await response.json();
                console.log(lastIds);

                let lastAprovalId = lastIds.ApprovalRequestID;
                console.log(lastAprovalId);

                function generateID() {
                    const prefix = "AR";
                    const number = lastAprovalId.toString().padStart(3, '0');
                    lastAprovalId++;
                    lastIds.ApprovalRequestID = lastAprovalId;
                    updateLastId(lastIds);
                    return prefix + number;
                }

                const updateLastId = async (updatedLastIds) => {
                    try {
                        const response = await fetch(`${lastIdUrl}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify(updatedLastIds)
                        });
                    } catch (error) {
                        console.error("Error updating LastId:", error);
                    }
                };

                if (amount && receiptNumber && receiptFile) {
                    const newApprovalRequest = {
                        id: generateID(),
                        RequestType: "payment",
                        MemberID: memberId,
                        PaymentDetails: {
                            PaymentType: "monthly",
                            Amount: parseFloat(amount),
                            ReceiptNumber: receiptNumber,
                            PaidDate: new Date().toISOString().split('T')[0]
                        },
                        Status: "pending"
                    };

                    const postResponse = await fetch(approvalRequestsUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newApprovalRequest)
                    });
                    alert('Payment request sent to admin for approval!');
                } else {
                    alert('Please complete all fields.');
                }
            };

            fetchlastId();
        };
        fetchApprovals();
    });
};

    fetchData();
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
        window.location.href = `./payment.html?memberId=${memberId}`;
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






