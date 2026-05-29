const API_URL =
  "https://script.google.com/macros/s/AKfycbwnOSAN6IE16bCa7GRVGqTHOguzIYq82k2x1PI_eaON32vGk5DdAjgF2uX6oNbKieu9og/exec";

let allRecords = [];

let currentEvent = "100m";


// INIT

async function init() {

  try {

    const res =
      await fetch(API_URL);

    const data =
      await res.json();

    allRecords = data;

    renderTabs();

    updateUI(currentEvent);

  } catch(error) {

    console.error(error);
  }
}

init();


// UPDATE UI

function updateUI(event) {

  currentEvent = event;

  renderPB(event);

  renderRecords(event);

  updateActiveTab();
}


// TABS

function renderTabs() {

  const tabs =
    document.getElementById("tabs");

  tabs.innerHTML = "";

  const events =
    [...new Set(
      allRecords.map(r => r.event)
    )];

  events.forEach(event => {

    tabs.innerHTML += `
      <button
        class="tab"
        onclick="updateUI('${event}')"
      >
        ${event}
      </button>
    `;
  });
}

function updateActiveTab() {

  const tabs =
    document.querySelectorAll(".tab");

  tabs.forEach(tab => {

    if (
      tab.innerText === currentEvent
    ) {

      tab.classList.add("active");

    } else {

      tab.classList.remove("active");
    }
  });
}


// PB

function renderPB(event) {

  const filtered =
    allRecords.filter(
      r => r.event === event
    );

  if (!filtered.length) {
    return;
  }

  const pb =
    filtered.sort(
      (a, b) =>
        Number(a.time) -
        Number(b.time)
    )[0];

  document.getElementById(
    "pbTime"
  ).innerText =
    Number(pb.time).toFixed(2);

  document.getElementById(
    "pbMeet"
  ).innerText =
    `${pb.meet} · ${formatDate(pb.date)}`;

  document.getElementById(
    "heroEvent"
  ).innerText =
    pb.event;

  document.getElementById(
    "heroWind"
  ).innerText =
    formatWind(pb.wind);
}


// RECORDS

function renderRecords(event) {

  const recordsEl =
    document.getElementById("records");

  recordsEl.innerHTML = "";

  const filtered =
    allRecords
      .filter(
        r => r.event === event
      )
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

  filtered
    .slice(0, 5)
    .forEach(record => {

      recordsEl.innerHTML += `

        <div class="record-card">

          <div class="record-left">

            <div class="record-icon"></div>

            <div>

              <div class="record-event">
                ${record.event}
              </div>

              <div class="record-meta">
                ${record.meet}<br>
                ${formatDate(record.date)}
              </div>

            </div>

          </div>

          <div class="record-right">

            <div class="record-time">
              ${Number(record.time).toFixed(2)}
            </div>

            <div class="record-wind">
              ${formatWind(record.wind)}
            </div>

          </div>

        </div>

      `;
    });
}


// ALL RECORDS

function openAllRecords() {

  const modal =
    document.getElementById(
      "allRecordsModal"
    );

  const list =
    document.getElementById(
      "allRecordsList"
    );

  list.innerHTML = "";

  const filtered =
    allRecords
      .filter(
        r => r.event === currentEvent
      )
      .sort(
        (a, b) =>
          new Date(b.date) -
          new Date(a.date)
      );

  filtered.forEach(record => {

    list.innerHTML += `

      <div class="record-card">

        <div class="record-left">

          <div class="record-icon"></div>

          <div>

            <div class="record-event">
              ${record.event}
            </div>

            <div class="record-meta">
              ${record.meet}<br>
              ${formatDate(record.date)}
            </div>

          </div>

        </div>

        <div class="record-right">

          <div class="record-time">
            ${Number(record.time).toFixed(2)}
          </div>

          <div class="record-wind">
            ${formatWind(record.wind)}
          </div>

        </div>

      </div>

    `;
  });

  modal.classList.add("show");
}

function closeAllRecords() {

  document
    .getElementById(
      "allRecordsModal"
    )
    .classList.remove("show");
}


// MODAL

function openModal() {

  document
    .getElementById("modal")
    .classList.add("show");
}

function closeModal() {

  document
    .getElementById("modal")
    .classList.remove("show");
}


// SAVE

async function saveRecord() {

  const saveBtn =
    document.getElementById("saveBtn");

  if (saveBtn.disabled) {
    return;
  }

  saveBtn.disabled = true;

  saveBtn.innerText =
    "保存中...";

  const record = {

    date:
      document.getElementById("date").value,

    meet:
      document.getElementById("meet").value,

    event:
      document.getElementById("event").value,

    time:
      Number(
        document.getElementById("time").value
      ),

    wind:
      Number(
        document.getElementById("wind").value
      )
  };

  if (
    !record.date ||
    !record.meet ||
    !record.event ||
    !record.time
  ) {

    alert("未入力があります");

    saveBtn.disabled = false;

    saveBtn.innerText = "保存";

    return;
  }

  try {

    const response =
      await fetch(API_URL, {

        method: "POST",

        body:
          JSON.stringify(record)
      });

    const result =
      await response.json();

    if (result.success) {

      saveBtn.innerText =
        "保存完了";

      document.getElementById("date").value = "";
      document.getElementById("meet").value = "";
      document.getElementById("event").value = "100m";
      document.getElementById("time").value = "";
      document.getElementById("wind").value = "";

      await init();

      setTimeout(() => {

        closeModal();

        saveBtn.disabled = false;

        saveBtn.innerText = "保存";

      }, 500);

    } else {

      alert(result.error);

      saveBtn.disabled = false;

      saveBtn.innerText = "保存";
    }

  } catch(error) {

    console.error(error);

    alert("保存失敗");

    saveBtn.disabled = false;

    saveBtn.innerText = "保存";
  }
}


// UTILS

function formatDate(date) {

  const d =
    new Date(date);

  return `${d.getFullYear()}/${
    d.getMonth() + 1
  }/${d.getDate()}`;
}

function formatWind(wind) {

  if (Number(wind) > 0) {
    return `+${wind}`;
  }

  return `${wind}`;
}


// PWA

if (
  "serviceWorker" in navigator
) {

  navigator.serviceWorker.register(
    "./service-worker.js"
  );
}