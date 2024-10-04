document.addEventListener('DOMContentLoaded', () => {

    const usersUrl = "http://localhost:3002/Users";
    const membersUrl = "http://localhost:3002/Members";
    const trainingProgramActivitiesUrl = "http://localhost:3002/TrainingProgramActivities";
    const enrolledTrainingProgramsUrl = "http://localhost:3002/EnrolledTrainingPrograms";
    const paymentsUrl = "http://localhost:3002/Payments";
    const lastIdUrl = "http://localhost:3002/LastId";

    let members = [];
    let trainingProgramActivities = [];
    let enrolledPrograms = [];
    let selectedActivities = [];
    let originalEnrolledPrograms = [];
    

    const contentTitle = document.getElementById('contentTitle');
    contentTitle.innerHTML = 'Enroll Programs';
    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Dash Board';
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
    const fetchLastId = async () => {
        const response = await fetch(lastIdUrl);
        return await response.json();
    };
  
    const fetchData = async () => {
        const membersResponse = await fetch(membersUrl);
        members = await membersResponse.json();

        const activitiesResponse = await fetch(trainingProgramActivitiesUrl);
        trainingProgramActivities = await activitiesResponse.json();

        const enrolledProgramsResponse = await fetch(enrolledTrainingProgramsUrl);
        enrolledPrograms = await enrolledProgramsResponse.json();

        populateMemberDropdown();
        populateTrainingPrograms();
    };

    const populateMemberDropdown = () => {
        const memberSelect = document.getElementById('memberSelect');
        memberSelect.innerHTML = ''; 
        let defaultOption = document.createElement('option');
        defaultOption.text = `Select Member`;
        memberSelect.appendChild(defaultOption);

        members.forEach(member => {
            const option = document.createElement('option');
            option.value = member.id;
            option.text = `${member.id} - ${member.UserName}`;
            memberSelect.appendChild(option);
        });

        memberSelect.addEventListener('change', handleMemberSelection);
    };

    const populateTrainingPrograms = () => {
        const cardioSection = document.getElementById('cardioPrograms');
        const weightSection = document.getElementById('weightPrograms');

        cardioSection.innerHTML = ''; 
        weightSection.innerHTML = ''; 

        trainingProgramActivities.forEach(activity => {
            const label = document.createElement('label');
            label.innerHTML = `${activity.ActivityName} - Rs ${activity.Cost}`;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = activity.ActivittID;
            checkbox.dataset.cost = activity.Cost;
            label.classList.add('program-checkbox-label');
            checkbox.classList.add('program-checkbox');

            checkbox.addEventListener('change', handleCheckboxChange);

            label.prepend(checkbox);

            if (activity.TypeID === 'P001') {
                cardioSection.appendChild(label);
            } else if (activity.TypeID === 'P002') {
                weightSection.appendChild(label);
            }
        });
    };
    let newlySelectedActivities = [];

    const handleMemberSelection = () => {
        const selectedMemberId = document.getElementById('memberSelect').value;
        if (!selectedMemberId) return;

        originalEnrolledPrograms = enrolledPrograms.filter(enroll => enroll.MemberID === selectedMemberId);

        selectedActivities = [];
        newlySelectedActivities = [];
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false; 
        });

        originalEnrolledPrograms.forEach(enrolled => {
            const checkbox = document.querySelector(`input[value="${enrolled.ActivittID}"]`);
            if (checkbox) {
                checkbox.checked = true;
                selectedActivities.push(parseInt(checkbox.dataset.cost, 10)); 
            }
        });

        const addProgramsBtn = document.getElementById('addProgramsBtn');
        if (originalEnrolledPrograms.length > 0) {
            addProgramsBtn.textContent = 'Update Program';
        } else {
            addProgramsBtn.textContent = 'Add Program';
        }

        calculateTotalCost();
    };

    const handleCheckboxChange = (event) => {
        const activityCost = parseInt(event.target.dataset.cost, 10);
        const activityId = event.target.value;
        const additionalPaymentElement = document.getElementById('additionalPayment');

        if (event.target.checked) {
            if (!originalEnrolledPrograms.some(enrolled => enrolled.ActivittID == activityId)) {
                newlySelectedActivities.push(activityCost);
                additionalPaymentElement.textContent = `Additional Payment: Rs ${activityCost}`;
            }
            selectedActivities.push(activityCost);
        } else {
            selectedActivities = selectedActivities.filter(cost => cost !== activityCost);
            newlySelectedActivities = newlySelectedActivities.filter(cost => cost !== activityCost);

            if (newlySelectedActivities.length === 0) {
                additionalPaymentElement.textContent = '';
            }
        }

        calculateTotalCost();
    };

    const calculateTotalCost = () => {
        const totalCost = selectedActivities.reduce((total, cost) => total + cost, 0);
        const newlySelectedCost = newlySelectedActivities.reduce((total, cost) => total + cost, 0);

        document.getElementById('totalPayment').textContent = `Total Payment: Rs ${totalCost}`;
        document.getElementById('additionalPayment').textContent = newlySelectedActivities.length > 0 ?
            `Additional Payment: Rs ${newlySelectedCost}` : '';
    };

    document.getElementById('addProgramsBtn').addEventListener('click', async (event) => {
        event.preventDefault();

        const selectedMemberId = document.getElementById('memberSelect').value;
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        const totalCost = selectedActivities.reduce((total, cost) => total + cost, 0);
        const newlySelectedCost = newlySelectedActivities.reduce((total, cost) => total + cost, 0);

        if (!selectedMemberId || totalCost === 0) {
            alert("Please select a member and at least one training program.");
            return;
        }
        let lastIds = await fetchLastId();

        const checkedPrograms = Array.from(document.querySelectorAll('input[type="checkbox"]:checked')).map(input => parseInt(input.value, 10));

        const removedPrograms = originalEnrolledPrograms.filter(enrolled => !checkedPrograms.includes(enrolled.ActivittID));
        for (const removedProgram of removedPrograms) {
            await fetch(`${enrolledTrainingProgramsUrl}/${removedProgram.id}`, { method: 'DELETE' });
        }

        for (const activityId of checkedPrograms) {
            const alreadyEnrolled = originalEnrolledPrograms.find(enrolled => enrolled.ActivittID === activityId);
            if (!alreadyEnrolled) {
                const newEnrollProgramId = generateID("E", lastIds.EnrollProgramID++);
                const activity = trainingProgramActivities.find(act => act.ActivittID === activityId);

                if (activity) {
                    const newEnrolledProgram = {
                        id: newEnrollProgramId,
                        MemberID: selectedMemberId,
                        ActivittID: activity.ActivittID,
                        ProgramTypeID: activity.TypeID
                    };

                    await fetch(enrolledTrainingProgramsUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newEnrolledProgram),
                    });
                }
            }
        }
        const newPaymentId = generateID("P", lastIds.PaymentID);
        lastIds.PaymentID++;
        await updateLastId(lastIds); 

        const paidDate = new Date();
        const dueDate = new Date();
        dueDate.setDate(paidDate.getDate() + 30); 

        if(newlySelectedCost!==0){

        const newPayment = {
            id: newPaymentId,
            MemberID: selectedMemberId,
            PaymentType: "Monthly",
            Amount: newlySelectedCost, 
            PaidDate: paidDate.toISOString().split('T')[0],
            DueDate: dueDate.toISOString().split('T')[0],
            PaymentMethod: paymentMethod
        };

        await fetch(paymentsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPayment),
        });
    
        alert("Programs and payment updated successfully!");
        selectedActivities = [];
        newlySelectedActivities = [];
        document.getElementById('totalPayment').textContent = '0';
        document.getElementById('additionalPayment').textContent = '';
     }else{
        alert("Programs updated successfully!");
     }
    });
    const updateLastId = async (updatedLastIds) => {
        await fetch(`${lastIdUrl}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedLastIds),
        });
    };

    const generateID = (prefix, lastId) => {
        const number = lastId.toString().padStart(3, '0');
        return `${prefix}${number}`;
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
        window.location.href = "../../login/login.html";
    });
    document.getElementById('dashboardBtn').addEventListener('click', () => {
        window.location.href = ` ../index.html?memberId=${memberId}`
    });
    document.getElementById('membersBtn').addEventListener('click', () => {
        window.location.href = ` ../memberManagemnt/memberManage.html?memberId=${memberId}`
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
        window.location.href = `../trainingProgramReport/trainingProgramReport.html?memberId=${memberId}`
    });
    document.getElementById('approvalRequestBtn').addEventListener('click', () => {
        window.location.href = `../approval/approval.html?memberId=${memberId}`
    });
    document.getElementById('enrollProgramBtn').addEventListener('click', () => {
        window.location.href = ` ./enrollProgram.html?memberId=${memberId}`
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
