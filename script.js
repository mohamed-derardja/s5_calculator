document.addEventListener('DOMContentLoaded', () => {
    // Setup Theory of Coding toggle
    const tocCheckbox = document.getElementById('toc_include_td');
    const tocTdInput = document.getElementById('toc_td');

    function toggleTocTd() {
        if (tocCheckbox.checked) {
            tocTdInput.disabled = false;
            tocTdInput.classList.remove('disabled-cell');
            tocTdInput.placeholder = ""; 
        } else {
            tocTdInput.disabled = true;
            tocTdInput.classList.add('disabled-cell');
            tocTdInput.value = ''; // Clear value when disabled
            tocTdInput.placeholder = "--";
        }
    }

    tocCheckbox.addEventListener('change', toggleTocTd);
    // Initial State
    toggleTocTd();
});

function getVal(id) {
    const el = document.getElementById(id);
    return (el && el.value !== '') ? parseFloat(el.value) : 0;
}

// Helper to check if user has entered any detailed grades
function hasDetails(...ids) {
    return ids.some(id => {
        const el = document.getElementById(id);
        return el && el.value !== '';
    });
}

function calculateModule(exam, td, tp, type) {
    // Types: 
    // 0: Exam 50%, (TD+TP)/2 50%
    // 1: Exam 60%, TD 40%
    // 2: Exam 60%, TP 40%
    // 3: Exam 100%
    
    let avg = 0;
    if (type === 0) {
        // Coeff 4 modules (Crypto, Op Research, Compilation)
        // controle is 0.50 , and the td and the tp toghether 0.5
        const practicalAvg = (td + tp) / 2;
        avg = (exam * 0.5) + (practicalAvg * 0.5);
    } else if (type === 1) {
        // Soft Eng, Theory (if TD included)
        avg = (exam * 0.6) + (td * 0.4);
    } else if (type === 2) {
        // Python, Web Dev
        avg = (exam * 0.6) + (tp * 0.4);
    } else if (type === 3) {
        // Theory (Exam Only)
        avg = exam * 1.0;
    }
    return Math.min(20, Math.max(0, avg)); // Clamp 0-20
}

function setRes(id, val) {
    const el = document.getElementById(id);
    if(el) el.value = val.toFixed(2);
}

// Logic: If inputs exist, calculate and update result. If not, use existing result (manual override).
function processModule(prefix, type, coeff) {
    const examId = `${prefix}_exam`;
    const tdId = `${prefix}_td`;
    const tpId = `${prefix}_tp`;
    const resId = `${prefix}_avg`;

    let avg = 0;
    
    // Check if we have source inputs to calculate from
    const inputsExist = hasDetails(examId, tdId, tpId);

    if (inputsExist) {
        const exam = getVal(examId);
        const td = getVal(tdId);
        const tp = getVal(tpId);
        avg = calculateModule(exam, td, tp, type);
        setRes(resId, avg);
    } else {
        // No inputs, try to grab the average directly from the result box
        // allowing the user to bypass detailed entry
        const manualAvg = getVal(resId);
        avg = manualAvg;
    }

    return avg * coeff;
}

function calculateGPA() {
    let totalScore = 0;
    let totalCoeffs = 0;

    // 1. Cryptography (Coeff 4)
    totalScore += processModule('crypto', 0, 4);
    totalCoeffs += 4;

    // 2. Operational Research (Coeff 4)
    totalScore += processModule('op', 0, 4);
    totalCoeffs += 4;

    // 3. Compilation (Coeff 4)
    totalScore += processModule('comp', 0, 4);
    totalCoeffs += 4;

    // 4. Software Engineering (Coeff 2)
    totalScore += processModule('soft', 1, 2);
    totalCoeffs += 2;

    // 5. Python (Coeff 2)
    totalScore += processModule('python', 2, 2);
    totalCoeffs += 2;

    // 6. Web Development (Coeff 2)
    totalScore += processModule('web', 2, 2);
    totalCoeffs += 2;

    // 7. Theory of Coding (Coeff 1)
    // Custom logic due to checkbox
    const toc_include_td = document.getElementById('toc_include_td').checked;
    const toc_type = toc_include_td ? 1 : 3;

    // We only check inputs relevant to the mode
    const inputsToCheck = ['toc_exam'];
    if (toc_include_td) inputsToCheck.push('toc_td');

    let toc_avg = 0;
    if (hasDetails(...inputsToCheck)) {
        const toc_exam = getVal('toc_exam');
        const toc_td = getVal('toc_td');
        if (toc_include_td) {
            toc_avg = calculateModule(toc_exam, toc_td, 0, 1);
        } else {
            toc_avg = calculateModule(toc_exam, 0, 0, 3);
        }
        setRes('toc_avg', toc_avg);
    } else {
         toc_avg = getVal('toc_avg');
    }
    
    totalScore += toc_avg * 1;
    totalCoeffs += 1;

    // 8. Business Intelligence (Coeff 1)
    totalScore += processModule('bi', 3, 1);
    totalCoeffs += 1;

    // Final Calculation
    const finalGpa = totalScore / totalCoeffs;
    const finalDisplay = document.getElementById('final_gpa');
    finalDisplay.textContent = finalGpa.toFixed(2);


    const resultSection = document.getElementById('final-result');
    resultSection.classList.remove('hidden');
    resultSection.scrollIntoView({ behavior: 'smooth' });

    // Color coding
    const circle = document.querySelector('.grade-circle');
    const msg = document.getElementById('grade_message');

    if (finalGpa >= 10) {
        circle.style.backgroundColor = '#10b981'; // Green
        msg.textContent = "Congratulations! You passed.";
        msg.style.color = '#10b981';
    } else {
        circle.style.backgroundColor = '#ef4444'; // Red
        msg.textContent = "Keep trying! You need 10 to pass.";
        msg.style.color = '#ef4444';
    }
}

function resetForm() {
    document.getElementById('gpaForm').reset();
    document.querySelectorAll('[id$="_avg"]').forEach(el => el.textContent = '--');
    document.getElementById('final-result').classList.add('hidden');
    // Trigger checkbox event to reset visibility logic
    document.getElementById('toc_include_td').dispatchEvent(new Event('change'));
}