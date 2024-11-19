// Function to update matrix input fields based on selected size
function updateMatrixInputs() {
    const size = parseInt(document.getElementById('matrix-size').value); // Get selected matrix size
    const matrixInputs = document.getElementById('matrix-inputs'); // Get container for matrix inputs
    matrixInputs.innerHTML = ''; // Clear existing inputs

    // Remove existing labels if any
    const existingLabels = document.querySelector('.matrix-labels');
    if (existingLabels) {
        existingLabels.remove();
    }

    updateMatrixLabels();

    // Create input fields for the matrix
    for (let i = 0; i < size; i++) {
        const row = document.createElement('div'); // Create a new row
        row.className = 'matrix-row'; // Add class to the row
        for (let j = 0; j < size + 1; j++) {
            const input = document.createElement('input'); // Create an input field
            input.type = 'number'; // Set input type to number
            input.value = '0'; // Set default value
            input.step = 'any'; // Allow any number (including decimals)
            input.setAttribute('aria-label', `Row ${i + 1}, Column ${j + 1}`); // Add aria-label for accessibility
            row.appendChild(input); // Add input to the row
        }
        matrixInputs.appendChild(row); // Add row to the matrix inputs container
    }
}

// Function to generate matrix labels
function updateMatrixLabels() {
    const size = parseInt(document.getElementById('matrix-size').value);
    const labelsContainer = document.createElement('div');
    labelsContainer.className = 'matrix-labels';
    const labels =  size === 0 ? [] :
                    size === 2 ? ['x', 'y', 'constant'] :
                    size === 3 ? ['x', 'y', 'z', 'constant'] :
                    ['x', 'y', 'z', 'w', 'constant'];

    labels.forEach(label => {
        const labelElement = document.createElement('div');
        labelElement.className = 'matrix-label';
        labelElement.textContent = label;
        labelsContainer.appendChild(labelElement);
    });

    const matrixInputs = document.getElementById('matrix-inputs');
    matrixInputs.parentNode.insertBefore(labelsContainer, matrixInputs);
}

// Function to get the current matrix values
function getMatrix() {
    const size = parseInt(document.getElementById('matrix-size').value); // Get selected matrix size
    const matrix = []; // Initialize empty matrix
    const inputs = document.querySelectorAll('#matrix-inputs input'); // Get all input fields

    // Populate the matrix with input values
    for (let i = 0; i < size; i++) {
        const row = []; // Initialize a new row
        for (let j = 0; j < size + 1; j++) {
            row.push(parseFloat(inputs[i * (size + 1) + j].value) || 0); // Add value to row, default to 0 if empty
        }
        matrix.push(row); // Add row to matrix
    }

    return matrix; // Return the complete matrix
}

// Function to calculate the determinant of a matrix
function determinant(matrix) {
    const n = matrix.length; // Get matrix size
    if (n === 1) return matrix[0][0]; // Base case: 1x1 matrix
    if (n === 2) return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]; // Base case: 2x2 matrix

    let det = 0; // Initialize determinant
    for (let j = 0; j < n; j++) {
        // Create submatrix by removing first row and current column
        const subMatrix = matrix.slice(1).map(row => [...row.slice(0, j), ...row.slice(j + 1)]);
        det += Math.pow(-1, j) * matrix[0][j] * determinant(subMatrix); // Recursive call for submatrix
    }
    return det; // Return calculated determinant
}

// Function to validate user inputs
function validateInputs() {
    const inputs = document.querySelectorAll('#matrix-inputs input'); // Get all input fields
    for (let input of inputs) {
        if (input.value.trim() === '') { // Check if any input is empty
            showMessage('Please fill in all fields.', 'error'); // Show error message
            return false; // Validation failed
        }
    }
    return true; // All inputs are valid
}

// Function to calculate and display determinants
function getDeterminants() {
    document.getElementById('result').innerHTML="";
    document.getElementById('step-by-step').innerHTML="";

    if (!validateInputs()) return; // Validate inputs before proceeding

    const matrix = getMatrix(); // Get current matrix
    const n = matrix.length; // Get matrix size
    const coefficients = matrix.map(row => row.slice(0, -1)); // Get coefficient matrix
    const mainDet = determinant(coefficients); // Calculate main determinant

    let determinantsHtml = '<h2>Determinants</h2>'; // Start building HTML for determinants
    determinantsHtml += `<p><strong>Main Determinant:</strong> ${mainDet.toFixed(4)}</p>`; // Add main determinant

    // Calculate and add determinants for each variable
    const variables = ['X', 'Y', 'Z', 'W'];
    for (let i = 0; i < n; i++) {
        const modifiedMatrix = matrix.map(row => [...row.slice(0, i), row[n], ...row.slice(i + 1, n)]);
        const det = determinant(modifiedMatrix);
        determinantsHtml += `<p><strong>det|A<sub>${variables[i]}</sub>|:</strong> ${det.toFixed(4)}</p>`;
    }

    document.getElementById('determinants').innerHTML = determinantsHtml; // Display determinants
}

// Function to solve the matrix using Cramer's rule
function solve() {
    document.getElementById('determinants').innerHTML="";
    if (!validateInputs()) return; // Validate inputs before proceeding

    const matrix = getMatrix(); // Get current matrix
    const n = matrix.length; // Get matrix size
    const mainDet = determinant(matrix.map(row => row.slice(0, -1))); // Calculate main determinant

    let stepByStep = '<h2>Step-by-Step Solution</h2>'; // Start building step-by-step solution HTML

    stepByStep += `<div class="step"><strong>Step 1:</strong> Calculate the determinant of the coefficient matrix.<br>det|A| = ${mainDet.toFixed(4)}</div>`;

    if (mainDet === 0) { // Check if the system has no unique solution
        document.getElementById('result').innerHTML = '<strong>Result:</strong> The system has no unique solution.';
        document.getElementById('step-by-step').innerHTML = stepByStep;
        return;
    }

    
    const variables = ['X', 'Y', 'Z', 'W'];
    const solutions = []; // Initialize array for solutions
    for (let i = 0; i < n; i++) {
        // Create modified matrix for each variable
        const modifiedMatrix = matrix.map(row => [...row.slice(0, i), row[n], ...row.slice(i + 1, n)]);
        const det = determinant(modifiedMatrix); // Calculate determinant of modified matrix
        solutions.push(det / mainDet); // Calculate and store solution

        // Add step to the step-by-step solution
        stepByStep += `<div class="step"><strong>Step ${i + 2}:</strong> Calculate det|A<sub>${variables[i]}</sub>| and ${variables[i]}.<br>`;
        stepByStep += `det|A<sub>${variables[i]}</sub>| = ${det.toFixed(4)}<br>`;
        stepByStep += `${variables[i]} = det|A<sub>${variables[i]}</sub>| / det|A| = ${solutions[i].toFixed(4)}</div>`;
    }

    // Display results and step-by-step solution
    document.getElementById('result').innerHTML = '<strong>Result:</strong><br>' + solutions.map((sol, i) => `<strong>${variables[i]}</strong> = ${sol.toFixed(4)}`).join('<br>');
    document.getElementById('step-by-step').innerHTML = stepByStep;
}

// Function to generate random inputs for the matrix
function generateRandomInputs() {
    const size = parseInt(document.getElementById('matrix-size').value); // Get selected matrix size
    const inputs = document.querySelectorAll('#matrix-inputs input'); // Get all input fields
    inputs.forEach(input => {
        input.value = (Math.random() * 20 - 10).toFixed(2); // Set random value between -10 and 10
    });

    document.getElementById('determinants').innerHTML='';
    document.getElementById('result').innerHTML='';
    document.getElementById('step-by-step').innerHTML='';
}

// Function to save the current matrix
function saveMatrix() {
    const matrix = getMatrix(); // Get current matrix
    const size = matrix.length; // Get matrix size
    const name = prompt("Enter a name for this matrix:"); // Prompt user for matrix name
    if (name) {
        try {
            localStorage.setItem(name, JSON.stringify({size, matrix})); // Save matrix to localStorage
            showMessage(`Matrix "${name}" saved successfully.`, 'success'); // Show success message
        } catch (e) {
            showMessage('Failed to save matrix. Storage might be full.', 'error'); // Show error message if save fails
        }
    }
}

// Function to load a saved matrix
function loadMatrix() {
    const name = document.getElementById('load-matrix-name').value; // Get matrix name to load
    const saved = localStorage.getItem(name); // Retrieve saved matrix from localStorage
    if (saved) {
        try {
            const {size, matrix} = JSON.parse(saved); // Parse saved matrix data
            document.getElementById('matrix-size').value = size; // Set matrix size
            updateMatrixInputs(); // Update input fields for new size
            const inputs = document.querySelectorAll('#matrix-inputs input'); // Get all input fields
            matrix.forEach((row, i) => {
                row.forEach((value, j) => {
                    inputs[i * (size + 1) + j].value = value; // Set input values from saved matrix
                });
            });
            showMessage(`Matrix "${name}" loaded successfully.`, 'success'); // Show success message
        } catch (e) {   // error handling
            showMessage('Failed to load matrix. Data might be corrupted.', 'error'); // Show error message if load fails
        }
    } else {
        showMessage(`No matrix found with the name "${name}".`, 'error'); // Show error if matrix not found
        document.getElementById('matrix-size').value = "0";
        updateMatrixInputs();
    }
    document.getElementById('load-matrix-name').value = "";
    document.getElementById('determinants').innerHTML = "";
    document.getElementById('result').innerHTML = "";
    document.getElementById('step-by-step').innerHTML = "";
}

// Function to display messages to the user
function showMessage(text, type) {
    const messageEl = document.getElementById('message'); // Get message element
    messageEl.textContent = text; // Set message text
    messageEl.className = `message ${type}`; // Set message class (error or success)
    messageEl.style.display = 'block'; // Show message
    setTimeout(() => {
        messageEl.style.display = 'none'; // Hide message after 3 seconds
    }, 3000);
}

// Function to toggle dark mode
function toggleDarkMode() {
    const body = document.body;
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        darkModeToggle.textContent = '☀️';
    } else {
        darkModeToggle.textContent = '🌙';
    }
}
// Function to toggle the developers section
function toggleDevelopersSection() {
    const developersSection = document.getElementById('developers-section');
    const button = document.querySelector('.show-developers-btn');
    if (developersSection.style.display === 'none' || developersSection.style.display === '') {
        developersSection.style.display = 'grid';
        button.textContent = 'Hide Developers';
    } else {
        developersSection.style.display = 'none';
        button.textContent = 'Show Developers';
    }
}



// Initialize matrix inputs when page loads
updateMatrixInputs();