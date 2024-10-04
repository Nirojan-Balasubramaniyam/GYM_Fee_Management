document.addEventListener('DOMContentLoaded', () => {
    const usersUrl = "http://localhost:3002/Users";
    const membersUrl = "http://localhost:3002/Members";
    const lastIdUrl = "http://localhost:3002/LastId";
    const trainingProgramActivitiesUrl = "http://localhost:3002/TrainingProgramActivities";
    const enrolledTrainingProgramsUrl = "http://localhost:3002/EnrolledTrainingPrograms";
    const paymentsUrl = "http://localhost:3002/Payments";

    let members = [];
    let trainingProgramActivities = [];
    let enrolledPrograms = [];
    let payments = [];
    let editingMemberId = null; 
    let users = [];
    let contentTitle = document.getElementById('contentTitle');
    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Member Management';

    const fetchUsers = async () => {
        const response = await fetch(usersUrl);
        users = await response.json();
        console.log(users);
        let loggedInUser = users.find(user => user.MemberID === memberId);
        console.log(loggedInUser);
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
        const response = await fetch(enrolledTrainingProgramsUrl);
        enrolledPrograms = await response.json();

        const paymentResponse = await fetch(paymentsUrl);
        payments = await paymentResponse.json();

        displayMembers();
    };

    const fetchTrainingProgramActivities = async () => {
        const response = await fetch(trainingProgramActivitiesUrl);
        trainingProgramActivities = await response.json();
    };

    const displayMembers = async () => {
        await fetchTrainingProgramActivities();
        const memberTableBody = document.querySelector('#memberTable tbody');
        memberTableBody.innerHTML = "";

        members.forEach(member => {
            const memberId = member.id;
            const loggedInUserPrograms = enrolledPrograms.filter(program => program.MemberID === memberId);
            const monthlyPayment = payments.find(payment => payment.MemberID === memberId && payment.PaymentType === "Monthly");
            const trainingProgramsHTML = generateTrainingProgramList(loggedInUserPrograms);

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${member.id}</td>
                <td>${member.FirstName} ${member.LastName}</td>
                <td>${member.Phone}</td>
                <td>${trainingProgramsHTML}</td>
                <td>Rs ${monthlyPayment ? monthlyPayment.Amount : 'N/A'}</td>
                <td>
                    <button class="edit-btn">Edit</button>
                    <button class="delete-btn">Delete</button>
                </td>
            `;

            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            editBtn.addEventListener('click', () => editMember(member.id));
            deleteBtn.addEventListener('click', () => deleteMember(member.id));

            memberTableBody.appendChild(row);
        });
    };

    const generateTrainingProgramList = loggedInUserPrograms => {
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

    const generateListItems = (programs, activities, typeId) => {
        const filteredPrograms = programs.filter(program => program.ProgramTypeID === typeId);

        if (filteredPrograms.length === 0) {
            return typeId === "P001" ? '<p>No cardio programs enrolled</p>' : '<p>No weight training programs enrolled</p>';
        }

        return filteredPrograms.map(program => {
            const activity = activities.find(activity => activity.ActivittID === program.ActivittID);
            return activity ? activity.ActivityName : 'No matching activity';
        }).join(', ');
    };

    const deleteMember = async memberId => {
        if (confirm("Are you sure you want to delete this member?")) {
            await fetch(`${membersUrl}/${memberId}`, { method: "DELETE" });
            await fetch(`${usersUrl}/${memberId}`, { method: "DELETE" });
            alert("Deleted Successfully");
            await fetchMembers();
        }
    };

    const editMember = memberId => {
        const memberToEdit = members.find(member => member.id === memberId);

        if (memberToEdit) {
            document.getElementById('firstName').value = memberToEdit.FirstName;
            document.getElementById('lastName').value = memberToEdit.LastName;
            document.getElementById('username').value = memberToEdit.UserName;
            document.getElementById('nic').value = memberToEdit.NIC;
            document.getElementById('mobileNumber').value = memberToEdit.Phone;
            document.getElementById('dob').value = memberToEdit.DoB;
            document.getElementById('gender').value = memberToEdit.Gender;
            document.getElementById('address').value = memberToEdit.Adress;
            document.getElementById('emergencyContactName').value = memberToEdit.EmergencyContactPrsn;
            document.getElementById('emergencyContactNumber').value = memberToEdit.EmergencyContact;

            document.querySelector('.form-radio-group').style.display = 'none';
            document.getElementById('saveMemberBtn').textContent = "Edit Member";
            document.getElementById('modal-title').textContent = "Edit Member";
            editingMemberId = memberId;
            document.getElementById('memberModal').style.display = 'block';

            document.querySelectorAll('input[name="initialPayment"]').forEach(input => {
                input.required = false;
            });
        }
    };
    

    document.getElementById('memberForm').addEventListener('submit', async event => {
        event.preventDefault();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const username = document.getElementById('username').value;
        const nic = document.getElementById('nic').value;
        const mobileNumber = document.getElementById('mobileNumber').value;
        const dob = document.getElementById('dob').value;
        const gender = document.getElementById('gender').value;
        const address = document.getElementById('address').value;
        const emergencyContactName = document.getElementById('emergencyContactName').value;
        const emergencyContactNumber = document.getElementById('emergencyContactNumber').value;

        const updatedMember = {
            id: editingMemberId,
            FirstName: firstName,
            LastName: lastName,
            UserName: username,
            NIC: nic,
            Phone: mobileNumber,
            DoB: dob,
            Gender: gender,
            Adress: address,
            EmergencyContactPrsn: emergencyContactName,
            EmergencyContact: emergencyContactNumber,
        };

        const updateUser = {
            id: editingMemberId,
            MemberID: editingMemberId,
            UserName: username,
            Password: mobileNumber,
            UserRoll: "member"
        };

        if (editingMemberId) {
            const response = await fetch(`${membersUrl}/${editingMemberId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedMember),
            });

            const userUpdateresponse = await fetch(`${usersUrl}/${editingMemberId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateUser),
            });

            if (response.ok && userUpdateresponse.ok) {
                alert("Member updated successfully!");
                document.getElementById('memberForm').reset();
                document.getElementById('memberModal').style.display = 'none';
                document.getElementById('saveMemberBtn').textContent = "Add Member";
                document.getElementById('modal-title').textContent = "Add Member";
                editingMemberId = null;
                await fetchMembers();
            } else {
                alert("Failed to update member.");
            }
        }
    });

    const openModal = () => {
        document.getElementById('memberForm').reset();
        document.querySelector('.form-radio-group').style.display = 'block';
        document.getElementById('saveMemberBtn').textContent = "Add Member";
        document.getElementById('modal-title').textContent = "Add Member";
        document.querySelectorAll('input[name="initialPayment"]').forEach(input => {
            input.required = true;
        });
        document.getElementById('memberModal').style.display = 'block';
    };

    const closeModal = () => {
        document.getElementById('memberModal').style.display = 'none';
    };

    document.getElementById('openAddMemberModal').addEventListener('click', openModal);
    document.querySelector('.closeBtn').addEventListener('click', closeModal);

    document.getElementById('memberForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        //document.getElementById('memberForm').reset();

        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const username = document.getElementById('username').value;
        const nic = document.getElementById('nic').value;
        const mobileNumber = document.getElementById('mobileNumber').value;
        const gender = document.getElementById('gender').value;
        const dob = document.getElementById('dob').value;
        const address = document.getElementById('address').value;
        const emergencyContactName = document.getElementById('emergencyContactName').value;
        const emergencyContactNumber = document.getElementById('emergencyContactNumber').value;
        const initialPayment = document.querySelector('input[name="initialPayment"]:checked');


        if (!initialPayment) {
        console.log(initialPayment)

            alert("Please select an initial payment method.");
            return;  // Stop form submission if no payment method is selected
        }

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

        const generateID = (prefix, lastId) => {
            const number = lastId.toString().padStart(3, '0');
            return `${prefix}${number}`;
        };

        const lastIds = await fetchLastId();

        const newMemberId = generateID("M", lastIds.MemberId);
        lastIds.MemberId++;
        const newPaymentId = generateID("P", lastIds.PaymentID);
        lastIds.PaymentID++;

        await updateLastId(lastIds);

        const newMember = {
            id: newMemberId,
            FirstName: firstName,
            LastName: lastName,
            UserName: username,
            NIC: nic,
            Phone: mobileNumber,
            DoB: dob,
            Gender: gender,
            Adress: address,
            EmergencyContact: emergencyContactNumber,
            EmergencyContactPrsn: emergencyContactName,
        };

        const newPayment = {
            id: newPaymentId,
            MemberID: newMemberId,
            PaymentType: "Initial",
            Amount: 2500,
            PaymentMethod:initialPayment,
            PaidDate: new Date().toISOString().split('T')[0],
            DueDate: null,
        };

        const newUser = {
            id: newMemberId,
            MemberID: newMemberId,
            UserName: username,
            Password: mobileNumber,
            UserRoll: "member"
        }

        const addMemberResponse = await fetch(membersUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newMember),
        });

        const addPaymentResponse = await fetch(paymentsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newPayment),
        });

        const addUserResponse = await fetch(usersUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
        });

        if (addMemberResponse.ok && addPaymentResponse.ok) {
            alert("Member and payment added successfully!");
            closeModal();
            await fetchMembers();
        } else {
            alert("Failed to add member or payment.");
        }
    });


    fetchMembers();

    const buttons = document.querySelectorAll('#navItems li a');
    const reportButtons = document.querySelectorAll('#reportDropdown li a');
    resetButtons();

    function handleButtonClick(buttonGroup) {
        buttonGroup.forEach(button => {
            button.addEventListener('click', event => {
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
        this.innerHTML = sidebar.classList.contains('minimized') ? '<i class="fa-solid fa-bars"></i>' : '&times;';
    });

    document.getElementById("reportBtn").addEventListener("click", function () {
        const reportDropdown = document.getElementById("reportDropdown");
        const buttons = document.querySelectorAll('#reportDropdown li a');
        reportDropdown.style.display = reportDropdown.style.display === "none" || reportDropdown.style.display === "" ? "flex" : "none";
        buttons.forEach(button => button.classList.add('reportDropdownShow'));
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        window.location.href = "../../login/login.html";
    });
    document.getElementById('dashboardBtn').addEventListener('click', () => {
        window.location.href = `../index.html?memberId=${memberId}`
    });
    document.getElementById('membersBtn').addEventListener('click', () => {
        window.location.href = `./memberManage.html?memberId=${memberId}`
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
        window.location.href = `../enrollProgram/enrollProgram.html?memberId=${memberId}`
    });
});

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

function capitalizeFirstLetter(string) {
    return string.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}
