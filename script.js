/***********************
 * CONFIGURATION
 ***********************/
const students = [
  "Alice", "Bob", "Charlie", "Diana",
  "Emma", "Frank", "Grace", "Henry",
  "Isabel", "Jack", "Karen", "Leo",
  "Mona", "Nina", "Oscar", "Paul",
  "Quinn", "Rachel", "Sam", "Tina",
  "Uma", "Victor", "Wendy", "Xander",
  "Yara", "Zoe", "Alan", "Bella",
  "Carl", "Dana", "Eli", "Fiona",
  "Gabe", "Holly", "Ian"
];

const MAX_ATTEMPTS = 300;

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
  return array
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value);
}

function getPairKey(a, b) {
  return [a, b].sort().join("|");
}

/***********************
 * GROUPING LOGIC
 ***********************/
function splitIntoGroups(list, groupSize) {
  const groups = [];
  const total = list.length;

  const fullGroups = Math.floor(total / groupSize);
  const remainder = total % groupSize;

  let index = 0;

  // Create full-sized groups
  for (let i = 0; i < fullGroups; i++) {
    groups.push(list.slice(index, index + groupSize));
    index += groupSize;
  }

  // Create one smaller group if needed
  if (remainder > 0) {
    groups.push(list.slice(index, index + remainder));
  }

  return groups;
}

function groupCost(groups, history) {
  let cost = 0;

  for (const group of groups) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const key = getPairKey(group[i], group[j]);
        cost += history[key] || 0;
      }
    }
  }

  return cost;
}

function generateSmartGroups(groupSize) {
  const history = loadHistory();
  let bestGroups = null;
  let bestCost = Infinity;

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const shuffled = shuffle(students);
    const groups = splitIntoGroups(shuffled, groupSize);
    const cost = groupCost(groups, history);

    if (cost < bestCost) {
      bestCost = cost;
      bestGroups = groups;
    }
  }

  // Update history
  for (const group of bestGroups) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const key = getPairKey(group[i], group[j]);
        history[key] = (history[key] || 0) + 1;
      }
    }
  }

  saveHistory(history);
  return bestGroups;
}

/***********************
 * UI
 ***********************/
const groupsDiv = document.getElementById("groups");
const generateBtn = document.getElementById("generateBtn");
const resetBtn = document.getElementById("resetBtn");

function renderGroups(groups) {
  groupsDiv.innerHTML = "";

  groups.forEach((group, index) => {
    const div = document.createElement("div");
    div.className = "group";

    div.innerHTML = `
      <h2>Group ${index + 1} (${group.length})</h2>
      <p>${group.join("<br>")}</p>
    `;

    groupsDiv.appendChild(div);
  });
}

generateBtn.addEventListener("click", () => {
  const size = parseInt(document.getElementById("groupSize").value, 10);
  const groups = generateSmartGroups(size);
  renderGroups(groups);
});

resetBtn.addEventListener("click", () => {
  if (confirm("Really reset all group history?")) {
    localStorage.removeItem("pairHistory");
    alert("History cleared.");
  }
});
