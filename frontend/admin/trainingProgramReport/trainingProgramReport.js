document.addEventListener('DOMContentLoaded', () => {
    const usersUrl = "http://localhost:3002/Users";
    const paymentsUrl = "http://localhost:3002/Payments";
    const alertsUrl = "http://localhost:3002/Alerts";
    const membersUrl = 'http://localhost:3002/Members';
    const enrolledProgramsUrl = 'http://localhost:3002/EnrolledTrainingPrograms';
    const activitiesUrl = 'http://localhost:3002/TrainingProgramActivities';
    let members = [];
    let enrolledPrograms = [];
    let trainingActivities = [];
    let payments = [];
    let alerts = [];
    let users = [];
    let contentTitle = document.getElementById('contentTitle');

    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Training Program Report';
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
   
    const fetchData = async () => {
        const membersResponse = await fetch(membersUrl);
        members = await membersResponse.json();

        const enrolledProgramsResponse = await fetch(enrolledProgramsUrl);
        enrolledPrograms = await enrolledProgramsResponse.json();

        const activitiesResponse = await fetch(activitiesUrl);
        trainingActivities = await activitiesResponse.json();

        displayProgramReport(); 
    };

    const displayProgramReport = () => {
        const totalMembers = members.length;
        const tbody = document.querySelector('#programReportTable tbody');
        tbody.innerHTML = ''; 

        const selectedMembers = [...new Set(enrolledPrograms.map(program => program.MemberID))];
        const selectedMembersPercentage = ((selectedMembers.length / totalMembers) * 100).toFixed(0);

        const cardioMembers = enrolledPrograms.filter(program => program.ProgramTypeID === 'P001');
        const weightTrainingMembers = enrolledPrograms.filter(program => program.ProgramTypeID === 'P002');

        const cardioPercentage = ((cardioMembers.length / selectedMembers.length) * 100).toFixed(0);
        const weightTrainingPercentage = ((weightTrainingMembers.length / selectedMembers.length) * 100).toFixed(0);

        tbody.innerHTML += `
            <tr>
                <td>Total Members</td>
                <td>${totalMembers}</td>
            </tr>
            <tr>
                <td>Training Program Selected Members</td>
                <td>${selectedMembers.length} Memebers (${selectedMembersPercentage}%)</td>
            </tr>
            <tr>
                <td>Cardio</td>
                <td>${cardioMembers.length} Memebers (${cardioPercentage}%)</td>
            </tr>
            <tr>
                <td>Weight Training</td>
                <td>${weightTrainingMembers.length} Memebers (${weightTrainingPercentage}%)</td>
            </tr>
        `;

        const cardioSubPrograms = ['Running', 'Cycling', 'Aerobic'];
        cardioSubPrograms.forEach(subProgram => {
            const activityId = getActivityId(subProgram);
            const subProgramMembers = cardioMembers.filter(program => program.ActivittID === activityId);
            const subProgramPercentage = ((subProgramMembers.length / cardioMembers.length) * 100).toFixed(0);

            tbody.innerHTML += `
                <tr>
                    <td>${subProgram}</td>
                    <td>${subProgramMembers.length} Memebers (${subProgramPercentage}%)</td>
                </tr>
            `;
        });

        const weightTrainingSubPrograms = ['Body Shaping', 'Strength Training', 'Body Building'];
        weightTrainingSubPrograms.forEach(subProgram => {
            const activityId = getActivityId(subProgram);
            const subProgramMembers = weightTrainingMembers.filter(program => program.ActivittID === activityId);
            const subProgramPercentage = ((subProgramMembers.length / weightTrainingMembers.length) * 100).toFixed(0);

            tbody.innerHTML += `
                <tr>
                    <td>${subProgram}</td>
                    <td>${subProgramMembers.length} Memebers (${subProgramPercentage}%)</td>
                </tr>
            `;
        });
    };

    const getActivityId = (subProgramName) => {
        const activity = trainingActivities.find(activity => activity.ActivityName.toLowerCase() === subProgramName.toLowerCase());
        return activity ? activity.ActivittID : null;
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
        window.location.href = `../paymentReport/paymentReport.html?memberId=${memberId}`
    });
    document.getElementById('programReportBtn').addEventListener('click', () => {
        window.location.href = `./trainingProgramReport.html?memberId=${memberId}`
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