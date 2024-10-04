document.addEventListener('DOMContentLoaded', () => {
    const usersUrl = "http://localhost:3002/Users";
  
    const paymentsUrl = "http://localhost:3002/Payments";
    const alertsUrl = "http://localhost:3002/Alerts";
    const membersUrl = "http://localhost:3002/Members";
    const enrolledTrainingProgramsUrl = "http://localhost:3002/EnrolledTrainingPrograms";
    const trainingProgramActivitiesUrl = "http://localhost:3002/TrainingProgramActivities";    
    let members = [];
    let enrolledPrograms = [];
    let trainingProgramActivities = [];
    let payments = [];
    let alerts = [];
    let users = [];

    let contentTitle = document.getElementById('contentTitle');
    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Member Report';
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

    const fetchMembers = async () => {
        const response = await fetch(membersUrl);
        members = await response.json();
        fetchEnrolledTrainingPrograms();
    };

    const fetchEnrolledTrainingPrograms = async () => {
        const enrolledResponse = await fetch(enrolledTrainingProgramsUrl);
        enrolledPrograms = await enrolledResponse.json();
        
        const activitiesResponse = await fetch(trainingProgramActivitiesUrl);
        trainingProgramActivities = await activitiesResponse.json();
        
        displayMembersReport();
    };

    const displayMembersReport = () => {
        const membersReportBody = document.getElementById('membersTableBody');
        membersReportBody.innerHTML = '';

        members.forEach((member, index) => {
            const memberPrograms = enrolledPrograms.filter(program => program.MemberID === member.id);
            const trainingProgramsHTML = generateTrainingProgramList(memberPrograms);

            const row = document.createElement('tr');
            row.classList.add('member-row');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${member.id}</td>
                <td>${member.LastName} ${member.FirstName}</td>
                <td>${member.Phone}</td>
                <td>${member.NIC}</td>
                <td>${trainingProgramsHTML}</td>
            `;

            membersReportBody.appendChild(row);
        });
    };

    const generateTrainingProgramList = (loggedInUserPrograms) => {
        const cardioPrograms = generateListItems(loggedInUserPrograms, trainingProgramActivities, "P001");
        const weightTrainingPrograms = generateListItems(loggedInUserPrograms, trainingProgramActivities, "P002");

        return `
            <div class="training-program-list">
            <div class="training-program-header">Cardio</div>
            <div class="training-program-list-items">${cardioPrograms}</div>
            <div class="training-program-header">Weight Training</div>
            <div class="training-program-list-items">${weightTrainingPrograms}</div>
        </div>
        `;
    };

    const generateListItems = (programs, activities, typeId) => {
        const filteredPrograms = programs.filter(program => program.ProgramTypeID === typeId);

        if (filteredPrograms.length === 0) {
            return typeId === "P001" ? '<div class="training-program-item">No cardio programs enrolled</div>' : '<div class="training-program-item">No weight training programs enrolled</div>';
        }

        return filteredPrograms.map(program => {
            const activity = activities.find(activity => activity.ActivittID === program.ActivittID);
            return activity ? `<div class="training-program-item">${activity.ActivityName}</div>` : '<div class="training-program-item">No matching activity</div>';
        }).join('');
    };

    fetchMembers();


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
        window.location.href = `./memberReport.html?memberId=${memberId}`
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