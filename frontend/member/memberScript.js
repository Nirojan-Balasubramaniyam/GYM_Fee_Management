document.addEventListener('DOMContentLoaded', () => {
    const membersUrl = "http://localhost:3002/Members";
    const trainingProgramTypesUrl = "http://localhost:3002/TrainingProgramTypes";
    const trainingProgramActivitiesUrl = "http://localhost:3002/TrainingProgramActivities";
    const enrolledTrainingProgramsUrl = "http://localhost:3002/EnrolledTrainingPrograms";
    const paymentsUrl = "http://localhost:3002/Payments";
    const alertsUrl = "http://localhost:3002/Alerts";

    let members = [];
    let trainingProgramActivities = [];
    let enrolledPrograms = [];
    let editingMemberId = null;
    const memberId = getQueryParam('memberId');

    console.log(memberId);
    const contentTitle = document.getElementById('contentTitle');
    contentTitle.innerHTML = 'User Info';

    const fetchMembers = async () => {
        const response = await fetch(membersUrl);
        members = await response.json();

        let loggedInUser = members.find(member => member.id === memberId);
        console.log(loggedInUser);

        if (loggedInUser) {
            document.getElementById('username').innerHTML = `${loggedInUser.FirstName} ${loggedInUser.LastName}`;
            displayMemberTable(loggedInUser);
        } else {
            console.log("Member not found");
        }
    };

    const displayMemberTable = (loggedInUser) => {
        const userTableBody = document.querySelector("#userInfo tbody");
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${loggedInUser.id}</td>
            <td>${loggedInUser.FirstName}</td>
            <td>${loggedInUser.LastName}</td>
            <td>${loggedInUser.NIC}</td>
            <td>${loggedInUser.Phone}</td>
            <td>${loggedInUser.RegistrationDate}</td>
        `;
        userTableBody.appendChild(row);
    };

    const fetchEnrolledTrainingPrograms = async () => {
        const response = await fetch(enrolledTrainingProgramsUrl);
        enrolledPrograms = await response.json();
        const loggedInUserPrograms = enrolledPrograms.filter(program => program.MemberID === memberId);

        displayTrainingPrograms(loggedInUserPrograms);
    };

    const displayTrainingPrograms = (loggedInUserPrograms) => {
        const grid = document.querySelector('.user');
        const imgDiv = document.createElement('div');
        imgDiv.innerHTML = `<img src="../assessts/user-avatar-male-5.png" alt="" width="200px">`;

        const trainingProgramGrid = document.createElement('div');
        trainingProgramGrid.className = "card";

        fetchTrainingProgramActivities().then(() => {
            trainingProgramGrid.innerHTML = `
                <ul>
                    <p>Cardio</p>
                    <ul>${generateListItems(loggedInUserPrograms, trainingProgramActivities, "P001")}</ul>
                    <p>Weight Training</p>
                    <ul>${generateListItems(loggedInUserPrograms, trainingProgramActivities, "P002")}</ul>
                </ul>
            `;
            grid.appendChild(imgDiv);
            grid.appendChild(trainingProgramGrid);
        });
    };

    const fetchTrainingProgramActivities = async () => {
        const response = await fetch(trainingProgramActivitiesUrl);
        trainingProgramActivities = await response.json();
    };

    const generateListItems = (programs, activities, typeId) => {
        const filteredPrograms = programs.filter(program => program.ProgramTypeID === typeId);
        if (filteredPrograms.length === 0) {
            return typeId === "P001" ? '<li>No cardio programs enrolled</li>' : '<li>No weight training programs enrolled</li>';
        }

        return filteredPrograms
            .map(program => {
                const activity = activities.find(activity => activity.ActivittID === program.ActivittID);
                return activity ? `<li>Activity: ${activity.ActivityName}</li>` : '<li>No matching activity</li>';
            })
            .join('');
    };

    fetchMembers();
    fetchEnrolledTrainingPrograms();

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
         window.location.href = `./bmi/bmi.html?memberId=${memberId}`;
    });
    document.getElementById('paymentBtn').addEventListener('click', () => {
        window.location.href = `./payment/payment.html?memberId=${memberId}`;
    });
    document.getElementById('changeProgramsBtn').addEventListener('click', () => {
        window.location.href = `./changeProgram/changeProgram.html?memberId=${memberId}`;
    });
    document.getElementById('paymentHistoryBtn').addEventListener('click', () => {
        window.location.href = `./paymentHistory/paymentHistory.html?memberId=${memberId}`;
    });
    document.getElementById('userInfoBtn').addEventListener('click', () => {
        window.location.href = `./index.html?memberId=${memberId}`;
    });
    document.getElementById('changeInfoBtn').addEventListener('click', () => {
        window.location.href = `./changeInfo/changeInfo.html?memberId=${memberId}`;
    });
    document.getElementById('notificationBtn').addEventListener('click', () => {
        window.location.href = `./notification/notification.html?memberId=${memberId}`;
    });
    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = "../login/login.html";
    });

});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}
