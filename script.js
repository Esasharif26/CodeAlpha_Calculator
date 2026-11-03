
const currentDisplay = document.getElementById("current");
const previousDisplay = document.getElementById("previous");
const buttons = document.querySelectorAll("button");

let expression = "";
let justCalculated = false;

function updateDisplay() {
    currentDisplay.textContent = expression || "0";
}

function clearCalculator() {
    expression = "";
    previousDisplay.textContent = "";
    justCalculated = false;
    updateDisplay();
}

function deleteLast() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
}

function addValue(value) {
    const operators = ["+", "-", "*", "/"];

    if (justCalculated) {
        if (operators.includes(value) || value === "%") {
            justCalculated = false;
        } else {
            expression = "";
            previousDisplay.textContent = "";
            justCalculated = false;
        }
    }

    if (operators.includes(value)) {
        if (expression === "" && value !== "-") return;

        const last = expression.slice(-1);

        if (operators.includes(last)) {
            expression = expression.slice(0, -1);
        }
    }

    if (value === ".") {
        const lastNumber = expression.split(/[+\-*/%]/).pop();

        if (lastNumber.includes(".")) return;

        if (lastNumber === "") {
            expression += "0";
        }
    }

    expression += value;
    updateDisplay();
}

// Safe arithmetic parser (does not use eval)
function calculateExpression(input) {
    const tokens = input.match(/\d*\.?\d+|[+\-*/%]/g);

    if (!tokens || tokens.join("") !== input) {
        throw new Error("Invalid expression");
    }

    let position = 0;

    function parseExpression() {
        let value = parseTerm();

        while (tokens[position] === "+" || tokens[position] === "-") {
            const operator = tokens[position++];
            const next = parseTerm();

            value = operator === "+"
                ? value + next
                : value - next;
        }

        return value;
    }

    function parseTerm() {
        let value = parseFactor();

        while (
            tokens[position] === "*" ||
            tokens[position] === "/"
        ) {
            const operator = tokens[position++];
            const next = parseFactor();

            if (operator === "/" && next === 0) {
                throw new Error("Cannot divide by zero");
            }

            value = operator === "*"
                ? value * next
                : value / next;
        }

        return value;
    }

    function parseFactor() {
        let sign = 1;

        if (tokens[position] === "-") {
            sign = -1;
            position++;
        } else if (tokens[position] === "+") {
            position++;
        }

        const token = tokens[position++];

        if (!token || !/^\d*\.?\d+$/.test(token)) {
            throw new Error("Invalid number");
        }

        let value = sign * Number(token);

        while (tokens[position] === "%") {
            value = value / 100;
            position++;
        }

        return value;
    }

    const result = parseExpression();

    if (position !== tokens.length || !Number.isFinite(result)) {
        throw new Error("Invalid calculation");
    }

    return Number(result.toPrecision(12));
}

function calculate() {
    if (!expression) return;

    try {
        const result = calculateExpression(expression);

        previousDisplay.textContent = expression + " =";
        expression = String(result);
        justCalculated = true;

        updateDisplay();
    } catch (error) {
        currentDisplay.textContent = error.message;
        expression = "";
        justCalculated = false;
    }
}

// Button clicks
buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action === "clear") {
            clearCalculator();
        } else if (action === "delete") {
            deleteLast();
        } else if (action === "calculate") {
            calculate();
        } else if (value) {
            addValue(value);
        }
    });
});

// Keyboard support
document.addEventListener("keydown", event => {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);
    } else if (["+", "-", "*", "/", "%"].includes(key)) {
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape") {
        clearCalculator();
    }
});

updateDisplay();
