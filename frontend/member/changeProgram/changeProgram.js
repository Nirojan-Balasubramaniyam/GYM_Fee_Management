document.addEventListener('DOMContentLoaded', () => {
    const membersUrl = "http://localhost:3002/Members";
    const trainingProgramActivitiesUrl = "http://localhost:3002/TrainingProgramActivities";
    const enrolledTrainingProgramsUrl = "http://localhost:3002/EnrolledTrainingPrograms";
    const approvalRequestsUrl = "http://localhost:3002/ApprovalRequests";
    const lastIdUrl = "http://localhost:3002/LastId"; 

    const memberId = getQueryParam('memberId');

    let members = [];
    let allPrograms = [];
    let enrolledPrograms = [];
    let unselectedPrograms = []; 
    let selectedNewPrograms = []; 

    const fetchMembers = async () => {
        try {
            const response = await fetch(membersUrl);
            members = await response.json();
            let loggedInUser = members.find((member) => member.id === memberId);
            let userName = document.getElementById('username');
            userName.innerHTML = `${loggedInUser.FirstName} ${loggedInUser.LastName}`;
        } catch (error) {
            console.error("Error fetching members:", error);
        }
    };

    const fetchTrainingProgramActivities = async () => {
        try {
            const response = await fetch(trainingProgramActivitiesUrl);
            allPrograms = await response.json();

            const enrolledResponse = await fetch(enrolledTrainingProgramsUrl);
            enrolledPrograms = await enrolledResponse.json();

            populateTrainingPrograms(); 
        } catch (error) {
            console.error("Error fetching training programs:", error);
        }
    };

    const populateTrainingPrograms = () => {
        const cardioSection = document.getElementById('cardioPrograms');
        const weightSection = document.getElementById('weightPrograms');
        cardioSection.innerHTML = '';
        weightSection.innerHTML = '';

        allPrograms.forEach(activity => {
            const label = document.createElement('label');
            label.classList.add('program-label');
            label.innerHTML = `${activity.ActivityName} - Rs ${activity.Cost}`;
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = activity.ActivittID;
            checkbox.dataset.cost = activity.Cost;
            checkbox.classList.add('program-checkbox');

            const isEnrolled = enrolledPrograms.some(enrolled => enrolled.MemberID === memberId && enrolled.ActivittID === activity.ActivittID);
            if (isEnrolled) {
                checkbox.checked = true;
            }

            checkbox.addEventListener('change', (event) => {
                if (event.target.checked) {
                    selectedNewPrograms.push(activity); // Track newly selected programs
                } else if (isEnrolled && !event.target.checked) {
                    unselectedPrograms.push(activity); // Track unselected programs (already enrolled but now unchecked)
                }
            });

            label.prepend(checkbox);

            
            if (activity.TypeID === 'P001') {
                cardioSection.appendChild(label);
            } else if (activity.TypeID === 'P002') {
                weightSection.appendChild(label);
            }
        });
    };

    document.getElementById('changeButton').addEventListener('click', () => {
        const selectedPrograms = Array.from(document.querySelectorAll('#trainingProgramSelection input:checked')).map(input => {
            return allPrograms.find(p => p.ActivittID == input.value);
        });

        let totalCost = 0;
        selectedPrograms.forEach(program => {
            totalCost += program.Cost;
        });

        let currentCost = 0;
        enrolledPrograms.forEach(enrolledProgram => {
            if (enrolledProgram.MemberID === memberId) {
                let program = allPrograms.find(p => p.ActivittID === enrolledProgram.ActivittID);
                if (program) {
                    currentCost += program.Cost;
                }
            }
        });

        const additionalAmount = totalCost - currentCost;

        document.getElementById('totalCost').textContent = `Total Cost: ${totalCost} LKR`;
        if(additionalAmount){
        document.getElementById('additionalAmount').textContent = `Newly selected programs Amount: ${additionalAmount > 0 ? additionalAmount : 0} LKR`;
        }

        document.getElementById('popup').style.display = 'block';
        if (selectedNewPrograms.length === 0 && unselectedPrograms.length > 0) {
            // Disable fields in popup for only unselecting programs
            document.getElementById('receiptNumber').disabled = true;
            document.getElementById('receiptUpload').disabled = true;
        } else {
            // Enable fields if there are new selections
            document.getElementById('receiptNumber').disabled = false;
            document.getElementById('receiptUpload').disabled = false;
        }
    });

    // Handle submit button click inside the popup to send a new approval request
    document.getElementById('submitBtn').addEventListener('click', async () => {
        const additionalAmount = Number(document.getElementById('additionalAmount').textContent.split(' ')[4]); 
        console.log(additionalAmount)// Extract additional amount

        const today = new Date().toISOString().split('T')[0];
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        let lastIds = await fetchLastId();

        for (const program of unselectedPrograms) {
            const removeRequest = {
                id: generateID("AR", lastIds.ApprovalRequestID),
                RequestType: "removeTrainingProgram",
                MemberID: memberId,
                ProgramIDDetails: {
                    ActivittID: program.ActivittID,
                    ProgramTypeID: program.TypeID
                },
                Status: "Pending"
            };
            await sendApprovalRequest(removeRequest);
            lastIds.ApprovalRequestID++;
            await updateLastId(lastIds);
        }
        if (additionalAmount > 0) {
            for (const program of selectedNewPrograms) {
                const addRequest = {
                    id: generateID("AR", lastIds.ApprovalRequestID),
                    RequestType: "addTrainingProgram",
                    MemberID: memberId,
                    PaymentDetail: {
                        id: generateID("P", lastIds.PaymentID),
                        MemberID: memberId,
                        PaymentType: "Enrollprogram",
                        Amount: parseInt(additionalAmount), 
                        PaidDate: today,
                        DueDate: dueDate.toISOString().split('T')[0],
                        PaymentMethod: "Bank"
                    },
                    ProgramIDDetails: {
                        ActivittID: program.ActivittID,
                        ProgramTypeID: program.TypeID
                    },
                    Status: "Pending"
                };
                await sendApprovalRequest(addRequest);
                lastIds.PaymentID++;
                lastIds.ApprovalRequestID++;
                await updateLastId(lastIds);
            }
        }

        alert('Requests submitted successfully!');
        document.getElementById('popup').style.display = 'none'; 
    });

    const sendApprovalRequest = async (request) => {
        try {
            const response = await fetch(approvalRequestsUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error('Failed to add the request');
            }
        } catch (error) {
            console.error('Error submitting request:', error);
        }
    };
    document.getElementById('closePopup').addEventListener('click', () => {
        document.getElementById('popup').style.display = 'none';
    });
    fetchMembers();
    fetchTrainingProgramActivities();



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
        window.location.href = `./bmi.html?memberId=${memberId}`;
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
        window.location.href = `../changeInfo/changeInfo.html?memberId=${memberId}`;
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
