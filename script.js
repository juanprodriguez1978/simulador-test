let aciertos = 0;
let errores = 0;
let chart;
// Objeto para rastrear: { índicePregunta: eraCorrecta (bool) }
let respuestasUsuario = {};

function initChart() {
    const ctx = document.getElementById('progresoChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Aciertos', 'Errores'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#28a745', '#dc3545']
            }]
        },
        options: { responsive: true }
    });
}

async function loadQuiz() {
    try {
        const response = await fetch('preguntas.json');
        const preguntas = await response.json();
        const container = document.getElementById('quiz-container');

        preguntas.forEach((p, index) => {
            const card = document.createElement('div');
            card.className = 'question-card';
            
            card.innerHTML = `<h3>ID: ${p.id}. ${p.pregunta}</h3><div class="options-container" id="q-${index}"></div>`;
            
            container.appendChild(card);

            const optionsDiv = document.getElementById(`q-${index}`);
            p.opciones.forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.innerText = opt;
                btn.onclick = () => checkAnswer(i, p.correcta, optionsDiv, index);
                optionsDiv.appendChild(btn);
            });
        });
    } catch (error) {
        console.error("Error al cargar el JSON:", error);
    }
}

function checkAnswer(selected, correct, container, questionIndex) {
    const buttons = container.querySelectorAll('button');

    // 1. RECTIFICACIÓN: Si ya se había respondido, restamos el resultado previo
    if (respuestasUsuario.hasOwnProperty(questionIndex)) {
        if (respuestasUsuario[questionIndex] === true) {
            aciertos--;
        } else {
            errores--;
        }
    }

    // 2. LIMPIEZA: Quitamos cualquier marca previa (roja o verde) de TODOS los botones
    buttons.forEach(btn => {
        btn.classList.remove('correct', 'incorrect');
    });

    // 3. SELECCIÓN: Marcamos SOLO el botón que acabas de pulsar
    const isCorrect = (selected === correct);
    
    if (isCorrect) {
        buttons[selected].classList.add('correct');
        aciertos++;
    } else {
        buttons[selected].classList.add('incorrect');
        errores++;
    }

    // Guardamos el estado actual para permitir futuros cambios
    respuestasUsuario[questionIndex] = isCorrect;

    updateStats();
}

function updateStats() {
    document.getElementById('pass-cont').innerText = aciertos;
    document.getElementById('fail-cont').innerText = errores;
    
    const totalRespondidas = Object.keys(respuestasUsuario).length;
    document.getElementById('total-cont').innerText = totalRespondidas;

    chart.data.datasets[0].data = [aciertos, errores];
    chart.update();

    const msg = document.getElementById('status-msg');
    if (totalRespondidas > 0) {
        const ratioActual = aciertos / totalRespondidas;
        if (ratioActual >= 0.6) {
            msg.innerText = "Estado: APROBADO";
            msg.style.color = "green";
        } else {
            msg.innerText = "Estado: REPROBADO";
            msg.style.color = "red";
        }
    }
}

window.onload = () => {
    initChart();
    loadQuiz();
};