"use strict";

const STORAGE_KEY = "taskflow-comp4976-tasks";
const taskForm = document.getElementById("task-form");
const taskInput = document.getElementById("task-input");
const taskList = document.getElementById("task-list");
const taskCounter = document.getElementById("task-counter");
const emptyState = document.getElementById("empty-state");
const storageStatus = document.getElementById("storage-status");
let tasks = loadTasks();

function showStorageMessage(message) {
  storageStatus.textContent = message;
  storageStatus.hidden = false;
}

function loadTasks() {
  try {
    const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(storedTasks) || storedTasks.some(task =>
      (typeof task !== "string" && typeof task !== "object") ||
      (typeof task === "object" && (typeof task.text !== "string" || typeof task.completed !== "boolean"))
    )) {
      throw new Error("Unrecognized task data");
    }
    return storedTasks.map(task => typeof task === "string"
      ? { text: task, completed: false }
      : { text: task.text, completed: task.completed });
  } catch (error) {
    showStorageMessage("Saved tasks could not be loaded. Check that browser storage is available for this file.");
    return [];
  }
}

function saveTasks() {
  try {
    // Keep this application's saved list separate from other browser data.
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    storageStatus.hidden = true;
  } catch (error) {
    showStorageMessage("Tasks are available for this session, but could not be saved. Check your browser storage settings.");
  }
}

function renderTasks() {
  taskList.replaceChildren();

  tasks.forEach((task, index) => {
    const row = document.createElement("li");
    row.className = "task-row";
    row.classList.toggle("completed", task.completed);

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "task-checkbox";
    checkbox.id = `task-${index}`;
    checkbox.checked = task.completed;
    // Give even a blank task an accessible checkbox name.
    checkbox.setAttribute("aria-label", `Task ${index + 1}: ${task.text || "Blank task"}`);
    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;
      row.classList.toggle("completed", task.completed);
      saveTasks();
    });

    const label = document.createElement("label");
    label.className = "task-label";
    label.htmlFor = checkbox.id;
    // Treat descriptions as plain text, including HTML-like input.
    label.textContent = task.text;

    row.append(checkbox, label);
    taskList.append(row);
  });

  taskCounter.textContent = `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
  emptyState.hidden = tasks.length > 0;
}

taskForm.addEventListener("submit", event => {
  event.preventDefault();
  if (!taskInput.value.trim()) {
    taskInput.focus();
    return;
  }
  tasks.push({ text: taskInput.value, completed: false });
  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
});

renderTasks();
