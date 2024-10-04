document.addEventListener('DOMContentLoaded', () => {

    const membersUrl = "http://localhost:3002/Members";
    let contentTitle = document.getElementById('contentTitle');
    let members = [];


    const memberId = getQueryParam('memberId');
    console.log(memberId);
    contentTitle.innerHTML = 'Calculate BMI';


    const fetchMembers = async () => {
        const response = await fetch(membersUrl);
        members = await response.json();
        console.log(memberId)
        console.log(members);
        let loggedInUser = members.find((member) => member.id === memberId);
        console.log(loggedInUser)
        let userName = document.getElementById('username');
        userName.innerHTML = loggedInUser.FirstName + ' ' + loggedInUser.LastName;
    };
    fetchMembers();


    document.getElementById('bmiForm').addEventListener('submit', function (event) {
        event.preventDefault();
        const weight = parseFloat(document.getElementById('weight').value);
        const height = parseFloat(document.getElementById('height').value) / 100;

        if (weight > 0 && height > 0) {
            const bmi = (weight / (height * height)).toFixed(2);
            let resultMessage = '';
            let resultColor = '';

            if (bmi < 18.5) {
                resultMessage = `Your BMI is ${bmi}. You are underweight.`;
                resultColor = '#f39c12';
            } else if (bmi >= 18.5 && bmi <= 24.9) {
                resultMessage = `Your BMI is ${bmi}. You have a normal weight.`;
                resultColor = '#27ae60';
            } else if (bmi >= 25 && bmi <= 29.9) {
                resultMessage = `Your BMI is ${bmi}. You are overweight.`;
                resultColor = '#e67e22';
            } else {
                resultMessage = `Your BMI is ${bmi}. You are obese.`;
                resultColor = '#e74c3c';
            }

            const resultDiv = document.getElementById('result');
            resultDiv.textContent = resultMessage;
            resultDiv.style.color = resultColor;
            resultDiv.style.display = 'block';
        } else {
            alert('Please enter valid values for weight and height.');
        }
    });


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

})

function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}







