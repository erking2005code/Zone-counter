const KEY = "zone-counter-v1";
const $ = s => document.querySelector(s);
const entrancesEl = $("#entrances");
const dialog = $("#personDialog");
const form = $("#personForm");
const age = $("#age");
const isGroup = $("#isGroup");
const groupField = $("#groupField");
const peopleCount = $("#peopleCount");
let selectedGender = "";
let selectedEntrance = null;
let state = JSON.parse(localStorage.getItem(KEY) || "null") || {
  entrances: [
    { id: crypto.randomUUID(), name: "Entrance 1", total: 0 },
    { id: crypto.randomUUID(), name: "Entrance 2", total: 0 },
    { id: crypto.randomUUID(), name: "Entrance 3", total: 0 },
    { id: crypto.randomUUID(), name: "Entrance 4", total: 0 }
  ],
  records: []
};

function save() {
  localStorage.setItem(KEY, JSON.stringify(state));
  render();
}

function render() {
  entrancesEl.innerHTML = "";
  state.entrances.forEach(e => {
    const el = document.createElement("div");
    el.className = "entrance";
    el.innerHTML = `
      <div class="entrance-top">
        <input class="entrance-name-input" value="${escapeHtml(e.name)}" aria-label="Entrance name">
        <button class="icon remove" title="Remove entrance">🗑️</button>
      </div>
      <div class="count">${e.total}</div>
      <button class="pass">Someone passed</button>`;
    el.querySelector(".entrance-name-input").addEventListener("change", ev => {
      e.name = ev.target.value.trim() || "Unnamed";
      save();
    });
    el.querySelector(".remove").addEventListener("click", () => {
      if (state.entrances.length <= 1) return alert("Keep at least one entrance.");
      if (confirm(`Remove "${e.name}"? Existing records will stay.`)) {
        state.entrances = state.entrances.filter(x => x.id !== e.id);
        save();
      }
    });
    el.querySelector(".pass").addEventListener("click", () => openPerson(e.id));
    entrancesEl.appendChild(el);
  });
  const total = state.records.reduce((n,r) => n + r.peopleCount, 0);
  $("#summary").textContent = `${state.records.length} recorded event${state.records.length === 1 ? "" : "s"} • ${total} people counted`;
}

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
}

function openPerson(id) {
  selectedEntrance = id;
  selectedGender = "";
  document.querySelectorAll(".choice").forEach(b => b.classList.remove("selected"));
  age.value = "";
  isGroup.checked = false;
  groupField.classList.add("hidden");
  peopleCount.value = "";
  dialog.showModal();
}

document.querySelectorAll(".choice").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedGender = btn.dataset.gender;
    document.querySelectorAll(".choice").forEach(b => b.classList.toggle("selected", b === btn));
  });
});

isGroup.addEventListener("change", () => {
  groupField.classList.toggle("hidden", !isGroup.checked);
  if (!isGroup.checked) peopleCount.value = "";
});

$("#cancelDialog").addEventListener("click", () => dialog.close());

form.addEventListener("submit", ev => {
  ev.preventDefault();
  if (!selectedGender) return alert("Please select Male or Female.");
  if (!age.value) return alert("Please select an age range.");
  const count = isGroup.checked ? Number(peopleCount.value) : 1;
  if (isGroup.checked && (!Number.isInteger(count) || count < 2)) {
    return alert("A group must contain at least 2 people.");
  }
  const entrance = state.entrances.find(e => e.id === selectedEntrance);
  if (!entrance) return;
  entrance.total += count;
  state.records.push({
    id: crypto.randomUUID(),
    dateTime: new Date().toISOString(),
    entranceId: entrance.id,
    entrance: entrance.name,
    gender: selectedGender,
    ageRange: age.value,
    type: isGroup.checked ? "Group" : "Single",
    peopleCount: count
  });
  save();
  dialog.close();
});

$("#addEntrance").addEventListener("click", () => {
  const name = prompt("Entrance/direction name:", `Entrance ${state.entrances.length + 1}`);
  if (name && name.trim()) {
    state.entrances.push({ id: crypto.randomUUID(), name: name.trim(), total: 0 });
    save();
  }
});

$("#clearBtn").addEventListener("click", () => {
  if (!state.records.length) return;
  if (confirm("Delete all recorded data? Entrance settings will remain.")) {
    state.records = [];
    state.entrances.forEach(e => e.total = 0);
    save();
  }
});

$("#exportBtn").addEventListener("click", () => {
  if (!state.records.length) return alert("No data to export.");
  const headers = ["ID","Date","Time","Entrance/Direction","Gender","Age Range","Type","Number of People"];
  const rows = state.records.map(r => {
    const d = new Date(r.dateTime);
    return [r.id, d.toLocaleDateString(), d.toLocaleTimeString(), r.entrance, r.gender, r.ageRange, r.type, r.peopleCount];
  });
  const csv = [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], {type:"text/csv;charset=utf-8"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zone-data-${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

function csvCell(v) {
  return `"${String(v).replace(/"/g,'""')}"`;
}

let deferredPrompt;
window.addEventListener("beforeinstallprompt", e => {
  e.preventDefault();
  deferredPrompt = e;
  $("#installBtn").classList.remove("hidden");
});
$("#installBtn").addEventListener("click", async () => {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt = null;
  $("#installBtn").classList.add("hidden");
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js", { scope: "./" }));
}
render();
