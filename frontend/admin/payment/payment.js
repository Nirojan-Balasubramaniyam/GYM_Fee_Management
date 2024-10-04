document.addEventListener('DOMContentLoaded', () => {

    const usersUrl = "http://localhost:3002/Users";
    const membersUrl = "http://localhost:3002/Members";
    const enrolledTrainingProgramsUrl = "http://localhost:3002/EnrolledTrainingPrograms";
    const paymentsUrl = "http://localhost:3002/Payments";
    const trainingProgramActivitiesUrl = "http://localhost:3002/TrainingProgramActivities";
    const lastIdUrl = "http://localhost:3002/LastId"; 

    let members = [];
    let enrolledPrograms = [];
    let trainingProgramActivities = [];
    let payments = [];
    let users = [];
    let contentTitle = document.getElementById('contentTitle');

    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Make Payment';
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

    const fetchAllData = async () => {
        const membersResponse = await fetch(membersUrl);
        members = await membersResponse.json();

        const enrolledProgramsResponse = await fetch(enrolledTrainingProgramsUrl);
        enrolledPrograms = await enrolledProgramsResponse.json();

        const activitiesResponse = await fetch(trainingProgramActivitiesUrl);
        trainingProgramActivities = await activitiesResponse.json();

        const paymentsResponse = await fetch(paymentsUrl);
        payments = await paymentsResponse.json();
    };

    document.getElementById('searchUserBtn').addEventListener('click', () => {
        const searchValue = document.getElementById('searchUserInput').value.toLowerCase();
        const foundMember = members.find(member =>
            member.id.toLowerCase() === searchValue ||
            member.NIC.toLowerCase() === searchValue ||
            member.UserName.toLowerCase() === searchValue
        );

        if (foundMember) {
            displayMemberDetails(foundMember);
        } else {
            alert("Member not found.");
        }
    });

    const displayMemberDetails = (member) => {
        document.getElementById('userName').textContent = `${member.FirstName} ${member.LastName}`;
        document.getElementById('userID').textContent = member.id;

        const memberPrograms = enrolledPrograms.filter(program => program.MemberID === member.id);
        const memberPayments = payments.filter(payment => payment.MemberID === member.id && payment.PaymentType === "Monthly");

        if (memberPayments.length === 0) {
            alert("Please enroll training programs for MemberID = " + member.id);
            return;
        }

        const trainingProgramsHTML = generateTrainingProgramList(memberPrograms);
        document.getElementById('trainingProgramsDisplay').innerHTML = trainingProgramsHTML;

        const totalPayment = memberPrograms.reduce((total, program) => {
            const activity = trainingProgramActivities.find(activity => activity.ActivittID === program.ActivittID);
            return total + (activity ? activity.Cost : 0);
        }, 0);
        document.getElementById('totalPayment').textContent = `Rs ${totalPayment}`;

        if (memberPayments.length > 0) {
            const lastPayment = memberPayments.sort((a, b) => new Date(b.PaidDate) - new Date(a.PaidDate))[0];
            document.getElementById('lastPaidDate').textContent = lastPayment.PaidDate;
            document.getElementById('dueDate').textContent = lastPayment.DueDate || 'N/A';
        } else {
            document.getElementById('lastPaidDate').textContent = 'No payments found';
            document.getElementById('dueDate').textContent = 'N/A';
        }
    };

    const generateTrainingProgramList = (loggedInUserPrograms) => {
        const cardioPrograms = generateListItems(loggedInUserPrograms, trainingProgramActivities, "P001");
        const weightTrainingPrograms = generateListItems(loggedInUserPrograms, trainingProgramActivities, "P002");

        return `
            <ul>
                <h5>Cardio</h5>
                <ul>${cardioPrograms}</ul>
                <h5>Weight Training</h5>
                <ul>${weightTrainingPrograms}</ul>
            </ul>
        `;
    };


    function generateListItems(programs, activities, typeId) {
        const filteredPrograms = programs.filter(program => program.ProgramTypeID === typeId);

        if (filteredPrograms.length === 0) {
            return typeId === "P001" ? '<p>No cardio programs enrolled</p>' : '<p>No weight training programs enrolled</p>';
        }

        return filteredPrograms
            .map(program => {
                const activity = activities.find(activity => activity.ActivittID === program.ActivittID);
                return activity ? activity.ActivityName : 'No matching activity';
            })
            .join(', ');
    }

    document.getElementById('addPaymentBtn').addEventListener('click', async (event) => {
        console.log("Add Payment button clicked");
        event.preventDefault();
        const memberId = document.getElementById('userID').textContent;
        const paymentAmount = document.getElementById('paymentAmountInput').value;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        let lastIds = await fetchLastId();

    
        if (!memberId || !paymentAmount) {
            alert("Please select a member and enter a payment amount.");
            return;
        }

        const paidDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(paidDate.getDate() + 30);

        const newPayment = {
            id: generateID("P", lastIds.PaymentID),
            MemberID: memberId,
            PaymentType: "Monthly",
            Amount: Number(paymentAmount),
            PaidDate: paidDate.toISOString().split('T')[0],
            DueDate: dueDate.toISOString().split('T')[0],
            PaymentMethod: paymentMethod
        };

        const addPaymentResponse = await fetch(paymentsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPayment),
        });

        if (true) {
            lastIds.PaymentID++;
            await updateLastId(lastIds);
            alert("Payment added successfully!");
            await fetchAllData();
        } else {
            alert("Failed to add payment.");
        }
    });
    
    fetchAllData();
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
        window.location.href = "../../login/login.html";
    });
    document.getElementById('dashboardBtn').addEventListener('click', () => {
        window.location.href = `../index.html?memberId=${memberId}`
    });
    document.getElementById('membersBtn').addEventListener('click', () => {
        window.location.href = `../memberManagemnt/memberManage.html?memberId=${memberId}`
    });
    document.getElementById('paymentBtn').addEventListener('click', () => {
        window.location.href = `./payment.html?memberId=${memberId}`
    });
    document.getElementById('userReportBtn').addEventListener('click', () => {
        window.location.href = `../memberReport/memberReport.html?memberId=${memberId}`
    });
    document.getElementById('paymentReportBtn').addEventListener('click', () => {
        window.location.href = `../paymentReport/paymentReport.html?memberId=${memberId}`
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

