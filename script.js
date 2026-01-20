/***********************
 * CONFIGURATIE
 ***********************/
const ALL_STUDENTS = [
  "Alice","Bob","Charlie","Diana","Emma","Frank","Grace","Henry",
  "Isabel","Jack","Karen","Leo","Mona","Nina","Oscar","Paul",
  "Quinn","Rachel","Sam","Tina","Uma","Victor","Wendy","Xander",
  "Yara","Zoe","Alan","Bella","Carl","Dana","Eli","Fiona",
  "Gabe","Holly","Ian"
].sort((a, b) => a.localeCompare(b));

const MAX_ATTEMPTS = 300;

/***********************
 * STATUS
 ***********************/
let activeStudents = [];

/***********************
 * OPSLAG
 ***********************/
function loadHistory() {
  return JSON.parse(localStorage.getItem("pairHistory")) || {};
}

function saveHistory(history) {
  localStorage.setItem("pairHistory", JSON.stringify(history));
}

/***********************
 * HULPFUNCTIES
 ***********************/
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getPairKey(a, b) {
  return [a, b].sort().join("|");
}

/***********************
 * GROEPEN MAKEN
 ***********************/
function splitIntoGroups(list, size) {
  const groups = [];
  let i = 0;

  while (i < list.length) {
    groups.push(list.slice(i, i + size));
    i += size;
  }

  return groups;
}

function groupCost(groups, history) {
  let cost = 0;

  for (const group of groups) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        cost += history[getPairKey(group[i], group[j])] || 0;
      }
    }
  }

  return cost;
}

function generateSmartGroups(groupSize) {
  const history = loadHistory();
  let bestGroups, bestCost = Infinity;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const groups = splitIntoGroups(shuffle(activeStudents), groupSize);
    const cost = groupCost(groups, history);

    if (cost < bestCost) {
      bestCost = cost;
      bestGroups = groups;
    }
  }

  bestGroups.forEach(group => {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const key = getPairKey(group[i], group[j]);
        history[key] = (history[key] || 0) + 1;
      }
    }
  });

  saveHistory(history);
  return { groups: bestGroups, cost: bestCost };
}

/***********************
 * SCHERMEN
 ***********************/
const attendanceScreen = document.getElementById("attendanceScreen");
const appScreen = document.getElementById("app");

/***********************
 * AANWEZIGHEID
 ***********************/
const attendanceList = document.getElementById("attendanceList");
const continueBtn = document.getElementById("continueBtn");
const backBtn = document.getElementById("backBtn");

ALL_STUDENTS.forEach(name => {
  const div = document.createElement("div");
  div.className = "attendee";
  div.innerHTML = `
    <label>
      <input type="checkbox" checked> ${name}
    </label>
  `;
  attendanceList.appendChild(div);
});

continueBtn.onclick = () => {
  activeStudents = [...attendanceList.querySelectorAll("input")]
    .filter(cb => cb.checked)
    .map(cb => cb.parentElement.textContent.trim());

  if (activeStudents.length < 2) {
    alert("Niet genoeg leerlingen aanwezig.");
    return;
  }

  attendanceScreen.classList.add("hidden");
  appScreen.classList.remove("hidden");
};

backBtn.onclick = () => {
  appScreen.classList.add("hidden");
  attendanceScreen.classList.remove("hidden");
  document.getElementById("groups").innerHTML = "";
  document.getElementById("score").textContent = "";
};

/***********************
 * WEERGAVE
 ***********************/
const groupsDiv = document.getElementById("groups");
const scoreDiv = document.getElementById("score");

function renderGroups(groups) {
  groupsDiv.innerHTML = "";

  groups.forEach((group, i) => {
    const div = document.createElement("div");
    div.className = "group";
    div.innerHTML = `
      <h2>Groep ${i + 1}</h2>
      <p>${group.join("<br>")}</p>
    `;
    groupsDiv.appendChild(div);

    setTimeout(() => div.classList.add("visible"), i * 400);
  });
}

/***********************
 * KNOPPEN
 ***********************/
document.getElementById("generateBtn").onclick = () => {
  const size = +document.getElementById("groupSize").value;
  const result = generateSmartGroups(size);

  const maxCost = activeStudents.length * 5;
  const nieuwheid = Math.max(
    0,
    100 - Math.round((result.cost / maxCost) * 100)
  );

  scoreDiv.textContent = `Nieuwheidsscore: ${nieuwheid}%`;
  renderGroups(result.groups);
};

document.getElementById("resetBtn").onclick = () => {
  if (confirm("Weet je zeker dat je de geschiedenis wilt resetten?")) {
    localStorage.removeItem("pairHistory");
    alert("Geschiedenis is gewist.");
  }
};
