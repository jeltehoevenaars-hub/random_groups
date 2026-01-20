/***********************
 * CONFIGURATION
 ***********************/
const ALL_STUDENTS = [
  "Alice","Bob","Charlie","Diana","Emma","Frank","Grace","Henry",
  "Isabel","Jack","Karen","Leo","Mona","Nina","Oscar","Paul",
  "Quinn","Rachel","Sam","Tina","Uma","Victor","Wendy","Xander",
  "Yara","Zoe","Alan","Bella","Carl","Dana","Eli","Fiona",
  "Gabe","Holly","Ian"
];

const MAX_ATTEMPTS = 300;

/***********************
 * STATE
 ***********************/
let activeStudents = [];

/***********************
 * STORAGE
 ***********************/
function loadHistory() {
  return JSON.parse(localStorage.getItem("pairHistory")) || {};
}

function saveHistory(history) {
  localStorage.setItem("pairHistory", JSON.stringify(history));
}

/***********************
 * UTILITIES
 ***********************/
function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function getPairKey(a, b) {
  return [a, b].sort().join("|");
}

/***********************
 * GROUPING LOGIC
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

  // Update history
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
 * UI – ATTENDANCE
 ***********************/
const attendanceList = document.getElementById("attendanceList");
const continueBtn = document.getElementById("continueBtn");

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
    alert("Not enough students present.");
    return;
  }

  document.getElementById("attendanceScreen").classList.add("hidden");
  document.getElementById("app").classList.remove("hidden");
};

/***********************
 * UI – GROUP DISPLAY
 ***********************/
const groupsDiv = document.getElementById("groups");
const scoreDiv = document.getElementById("score");

function renderGroups(groups) {
  groupsDiv.innerHTML = "";

  groups.forEach((group, i) => {
    const div = document.createElement("div");
    div.className = "group";
    div.innerHTML = `
      <h2>Group ${i + 1} (${group.length})</h2>
      <p>${group.join("<br>")}</p>
    `;
    groupsDiv.appendChild(div);

    setTimeout(() => div.classList.add("visible"), i * 400);
  });
}

/***********************
 * CONTROLS
 ***********************/
document.getElementById("generateBtn").onclick = () => {
  const size = +document.getElementById("groupSize").value;
  const result = generateSmartGroups(size);

  const maxCost = activeStudents.length * 5;
  const newness = Math.max(0, 100 - Math.round((result.cost / maxCost) * 100));

  scoreDiv.textContent = `Newness score: ${newness}%`;
  renderGroups(result.groups);
};

document.getElementById("resetBtn").onclick = () => {
  if (confirm("Reset group history?")) {
    localStorage.removeItem("pairHistory");
    alert("History cleared.");
  }
};

document.getElementById("projectorBtn").onclick = () => {
  document.documentElement.classList.toggle("projector");
};
