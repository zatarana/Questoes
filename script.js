(() => {
  // As questões são definidas diretamente no código.
  let questions = [
    {
      id: 1,
      materia: "atualidades",
      banca: "IBPTEC",
      nivel: "superior",
      tags: ["Guerra na Ucrânia", "Nova Ordem Mundial"],
      text: "A invasão da Ucrânia pela Rússia, que ocorreu no dia 22 de fevereiro de 2022, pode ser vista como um conflito não apenas militar, mas também como um conflito econômico e político. Acerca dos conhecimentos sobre o fato histórico, marque a alternativa correta.",
      options: [
        "A guerra da Ucrânia é vista pelo eixo China, Rússia e Irã como a fase inicial do estabelecimento de uma Nova ordem Mundial, em que os Estados Unidos não seriam mais a potência mundial dominante, no chamado mundo multipolar.",
        "Além da guerra da Ucrânia, diversos outros conflitos em outras zonas mundiais podem ser analisados como o estabelecimento de uma nova ordem mundial, como a Guerra do Afeganistão, que teve início em 2003.",
        "A intervenção de outras potencias militares na guerra da Ucrânia, como a China, pode ser analisada como uma tentativa de conter o expansionismo Russo em direção ao leste da Europa.",
        "Não há qualquer relação da guerra da Ucrânia com a Nova Ordem Mundial, formalizada pela Rússia, China e Irã.",
        "A guerra da Ucrânia tem como uma de suas causas imediatas a invasão da Crimeia pela Rússia em 2014, após o presidente pró ocidente ter sido eleito nas eleições de 2013 na Ucrânia."
],
      correct: 0,
      resolution: "A alternativa correta é a terceira: o sujeito é 'os meninos', exigindo o verbo no plural.",
      dificuldade: "facil",
      ano: 2024
    },
    {
      id: 2,
      materia: "matematica",
      banca: "cespe",
      nivel: "dificil",
      tags: ["algebra", "equacoes"],
      text: "Qual a solução da equação x + 2 = 5?",
      options: [
        "x = 3",
        "x = 5",
        "x = 2"
      ],
      correct: 0,
      resolution: "Subtraindo 2 de ambos os lados, temos x = 3.",
      dificuldade: "facil",
      ano: 2023
    },
    {
      id: 3,
      materia: "historia",
      banca: "cespe",
      nivel: "medio",
      tags: ["contemporanea"],
      text: "Qual evento marcou o fim da Segunda Guerra Mundial?",
      options: [
        "A queda de Berlim",
        "A bomba atômica em Hiroshima",
        "O Tratado de Versalhes"
      ],
      correct: 1,
      resolution: "A bomba atômica em Hiroshima (juntamente com Nagasaki) foi decisiva para o fim da guerra.",
      dificuldade: "medio",
      ano: 1945
    }
    // Adicione mais questões se desejar.
  ];

  let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || {};
  let currentPage = 1;
  const questionsPerPage = 5;
  let currentFilter = null;

  function init() {
    // Restaura filtro salvo, se existir
    const savedFilter = localStorage.getItem("savedFilter");
    if (savedFilter) {
      currentFilter = JSON.parse(savedFilter);
      document.getElementById("materia").value = currentFilter.materia;
      document.getElementById("banca").value = currentFilter.banca;
      document.getElementById("nivel").value = currentFilter.nivel;
      document.getElementById("assunto").value = currentFilter.assunto;
      document.getElementById("status").value = currentFilter.status;
    } else {
      currentFilter = null;
    }
    updateDashboardStats();
    updateFilterOptions();
    renderQuestions();
    bindEvents();
  }

  function bindEvents() {
    document.getElementById("btn-toggle-theme").addEventListener("click", toggleTheme);
    document.getElementById("btn-apply-filter").addEventListener("click", applyFilters);
    document.getElementById("btn-clear-filter").addEventListener("click", clearFilters);
    document.getElementById("btn-save-filter").addEventListener("click", saveFilters);
    document.getElementById("prev-page").addEventListener("click", () => changePage(-1));
    document.getElementById("next-page").addEventListener("click", () => changePage(1));
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
  }

  function updateDashboardStats() {
    document.getElementById("total-questions").textContent = questions.length;
    const correctCount = Object.values(userAnswers).filter(v => v === true).length;
    const wrongCount = Object.values(userAnswers).filter(v => v === false).length;
    document.getElementById("correct-count").textContent = correctCount;
    document.getElementById("wrong-count").textContent = wrongCount;
    const answeredCount = Object.keys(userAnswers).length;
    const percent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;
    document.getElementById("progress-fill").style.width = percent + "%";
  }

  // Atualiza os selects de filtro com dados únicos (usando Set)
  function updateFilterOptions() {
    const materiaSet = new Set();
    const bancaSet = new Set();
    const nivelSet = new Set();
    const assuntoSet = new Set();

    questions.forEach(q => {
      if (q.materia) materiaSet.add(q.materia);
      if (q.banca) bancaSet.add(q.banca);
      if (q.nivel) nivelSet.add(q.nivel);
      if (Array.isArray(q.tags)) {
        q.tags.forEach(tag => {
          if (tag) assuntoSet.add(tag);
        });
      }
    });

    updateSelectOptions(document.getElementById("materia"), materiaSet);
    updateSelectOptions(document.getElementById("banca"), bancaSet);
    updateSelectOptions(document.getElementById("nivel"), nivelSet);
    updateSelectOptions(document.getElementById("assunto"), assuntoSet);
  }

  function updateSelectOptions(selectEl, valueSet) {
    selectEl.innerHTML = '<option value="all">Todos</option>';
    valueSet.forEach(val => {
      selectEl.innerHTML += `<option value="${val}">${capitalize(val)}</option>`;
    });
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function renderQuestions() {
    const listEl = document.getElementById("question-list");
    listEl.innerHTML = "";
    const filtered = getFilteredQuestions();
    const totalPages = Math.ceil(filtered.length / questionsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * questionsPerPage;
    const paginated = filtered.slice(start, start + questionsPerPage);

    if (paginated.length === 0) {
      listEl.innerHTML = "<p>Nenhuma questão encontrada.</p>";
    } else {
      paginated.forEach(q => {
        const answered = userAnswers[q.id] !== undefined;
        const disabledAttr = answered ? "disabled" : "";
        const div = document.createElement("div");
        div.id = `question_${q.id}`;
        div.className = "question";
        div.innerHTML = `
          <h3>${q.text}</h3>
          <div class="options">
            ${q.options.map((opt, i) => `
              <label>
                <input type="radio" name="question_${q.id}" value="${i}" ${disabledAttr} data-correct="${i === q.correct ? "true" : "false"}">
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>
          <button class="btn-primary" ${disabledAttr} data-id="${q.id}">Responder Questão</button>
          <div class="response-message">
            ${answered 
              ? (userAnswers[q.id]
                  ? "<span style='color: var(--success-color)'>Você acertou!</span>"
                  : "<span style='color: var(--error-color)'>Você errou!</span>") +
                (q.resolution ? `<div class="explanation"><strong>Explicação:</strong> ${q.resolution}</div>` : "")
              : ""}
          </div>
        `;
        listEl.appendChild(div);
        div.querySelector("button.btn-primary").addEventListener("click", () => submitAnswer(q.id));
      });
    }
    document.getElementById("current-page").textContent = currentPage;
    document.getElementById("total-pages").textContent = totalPages;
  }

  function getFilteredQuestions() {
    if (!currentFilter) return questions;
    return questions.filter(q => {
      let ok = true;
      if (currentFilter.materia !== "all")
        ok = ok && (q.materia === currentFilter.materia);
      if (currentFilter.banca !== "all")
        ok = ok && (q.banca === currentFilter.banca);
      if (currentFilter.nivel !== "all")
        ok = ok && (q.nivel === currentFilter.nivel);
      if (currentFilter.assunto !== "all")
        ok = ok && (q.tags.includes(currentFilter.assunto));
      if (currentFilter.status !== "all") {
        if (currentFilter.status === "acertadas")
          ok = ok && (userAnswers[q.id] === true);
        else if (currentFilter.status === "erradas")
          ok = ok && (userAnswers[q.id] === false);
        else if (currentFilter.status === "nao-respondidas")
          ok = ok && (userAnswers[q.id] === undefined);
      }
      return ok;
    });
  }

  function submitAnswer(qId) {
    if (userAnswers[qId] !== undefined) {
      alert("Você já respondeu esta questão.");
      return;
    }
    const radios = document.getElementsByName("question_" + qId);
    let selected = null;
    for (let radio of radios) {
      if (radio.checked) {
        selected = radio;
        break;
      }
    }
    if (!selected) {
      alert("Selecione uma opção primeiro!");
      return;
    }
    const isCorrect = selected.getAttribute("data-correct") === "true";
    userAnswers[qId] = isCorrect;
    localStorage.setItem("userAnswers", JSON.stringify(userAnswers));
    const qDiv = document.getElementById("question_" + qId);
    const respDiv = qDiv.querySelector(".response-message");
    respDiv.innerHTML = isCorrect
      ? "<span style='color: var(--success-color)'>Você acertou!</span>"
      : "<span style='color: var(--error-color)'>Você errou!</span>";
    const qObj = questions.find(q => q.id === qId);
    if (qObj && qObj.resolution) {
      respDiv.innerHTML += `<div class="explanation"><strong>Explicação:</strong> ${qObj.resolution}</div>`;
    }
    for (let radio of radios) {
      radio.disabled = true;
    }
    const btn = qDiv.querySelector("button.btn-primary");
    if (btn) btn.disabled = true;
    updateDashboardStats();
  }

  function changePage(offset) {
    const filtered = getFilteredQuestions();
    const total = Math.ceil(filtered.length / questionsPerPage) || 1;
    currentPage += offset;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > total) currentPage = total;
    renderQuestions();
  }

  // Funções de filtro para o usuário
  function applyFilters() {
    const fMateria = document.getElementById("materia").value;
    const fBanca = document.getElementById("banca").value;
    const fNivel = document.getElementById("nivel").value;
    const fAssunto = document.getElementById("assunto").value;
    const fStatus = document.getElementById("status").value;
    if (
      fMateria === "all" &&
      fBanca === "all" &&
      fNivel === "all" &&
      fAssunto === "all" &&
      fStatus === "all"
    ) {
      currentFilter = null;
    } else {
      currentFilter = {
        materia: fMateria,
        banca: fBanca,
        nivel: fNivel,
        assunto: fAssunto,
        status: fStatus,
      };
    }
    currentPage = 1;
    renderQuestions();
  }

  function clearFilters() {
    document.getElementById("materia").value = "all";
    document.getElementById("banca").value = "all";
    document.getElementById("nivel").value = "all";
    document.getElementById("assunto").value = "all";
    document.getElementById("status").value = "all";
    currentFilter = null;
    renderQuestions();
  }

  function saveFilters() {
    const fMateria = document.getElementById("materia").value;
    const fBanca = document.getElementById("banca").value;
    const fNivel = document.getElementById("nivel").value;
    const fAssunto = document.getElementById("assunto").value;
    const fStatus = document.getElementById("status").value;
    const filtro = { materia: fMateria, banca: fBanca, nivel: fNivel, assunto: fAssunto, status: fStatus };
    localStorage.setItem("savedFilter", JSON.stringify(filtro));
    alert("Filtro salvo!");
  }

  init();
})();
