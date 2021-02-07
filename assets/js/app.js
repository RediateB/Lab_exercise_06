// Define UI Variables
const taskInput = document.querySelector("#task"); //the task input text field
const form = document.querySelector("#task-form"); //The form at the top
const filter = document.querySelector("#filter"); //the task filter text field
const taskList = document.querySelector(".collection"); //The UL
const clearBtn = document.querySelector(".clear-tasks"); //the all task clear button
const ascend = document.querySelector('#ascend')
const descend = document.querySelector('#descend')
const reloadIcon = document.querySelector(".fa"); //the reload button at the top navigation

//DB variable
ascend.addEventListener("click", ascending);

descend.addEventListener("click", descending);

let DB;

// Add Event Listener [on Load]
document.addEventListener("DOMContentLoaded", () => {
  // create the database
  let TasksDB = indexedDB.open("tasks", 1);

  // if there's an error
  TasksDB.onerror = function () {
    console.log("There was an error");
  };
  // if everything is fine, assign the result to the instance
  TasksDB.onsuccess = function () {
    // console.log('Database Ready');

    // save the result
    DB = TasksDB.result;

    // display the Task List
    displayTaskList();
  };

  // This method runs once (great for creating the schema)
  TasksDB.onupgradeneeded = function (e) {
    // the event will be the database
    let db = e.target.result;

    // create an object store,
    // keypath is going to be the Indexes
    let objectStore = db.createObjectStore("tasks", {
      keyPath: "id",
      autoIncrement: true,
    });

    // createindex: 1) field name 2) keypath 3) options
    objectStore.createIndex("taskname", "taskname", { unique: false });
    let newTask={
      taskname:taskInput.value,
      created:new Date(),
    };
    console.log("Database ready and fields created!");
  };


  form.addEventListener("submit", addNewTask);

  function addNewTask(e) {
    e.preventDefault();

    // Check empty entry
    if (taskInput.value === "") {
      taskInput.style.borderColor = "red";

      return;
    }

    // create a new object with the form info
    let newTask = {
      taskname: taskInput.value,
    };

    // Insert the object into the database
    let transaction = DB.transaction(["tasks"], "readwrite");
    let objectStore = transaction.objectStore("tasks");

    let request = objectStore.add(newTask);

    // on success
    request.onsuccess = () => {
      form.reset();
    };
    transaction.oncomplete = () => {
      console.log("New appointment added");

      displayTaskList();
    };
    transaction.onerror = () => {
      console.log("There was an error, try again!");
    };
  }

  function displayTaskList() {
    // clear the previous task list
    while (taskList.firstChild) {
      taskList.removeChild(taskList.firstChild);
    }

    // create the object store
    let objectStore = DB.transaction("tasks").objectStore("tasks");

    objectStore.openCursor().onsuccess = function (e) {
      // assign the current cursor
      let cursor = e.target.result;

      if (cursor) {
        // Create an li element when the user adds a task
        const li = document.createElement("li");
        //add Attribute for delete
        li.setAttribute("data-task-id", cursor.value.id);
        // Adding a class
        li.className = "collection-item";
        // Create text node and append it
        li.appendChild(document.createTextNode(cursor.value.taskname));
        // Create new element for the link
        const link = document.createElement("a");
        // Add class and the x marker for a
        link.className = "delete-item secondary-content";
        link.innerHTML = `
                 <i class="fa fa-remove"></i>
                &nbsp;
                <a href="../../edit.html?id=${cursor.value.id}"><i class="fa fa-edit"></i> </a>
                `;
        // Append link to li
        li.appendChild(link);
        // Append to UL
        taskList.appendChild(li);
        cursor.continue();
      }
    };
  }

  // Remove task event [event delegation]
  taskList.addEventListener("click", removeTask);

  function removeTask(e) {
    if (e.target.parentElement.classList.contains("delete-item")) {
      if (confirm("Are You Sure about that ?")) {
        // get the task id
        let taskID = Number(
          e.target.parentElement.parentElement.getAttribute("data-task-id")
        );
        // use a transaction
        let transaction = DB.transaction("tasks", "readwrite");
        let ObjectStore = transaction.objectStore("tasks");
        ObjectStore.delete(taskID);
        transaction.oncomplete = () => {
          e.target.parentElement.parentElement.remove();
        };
      }
    }
  }

  //clear button event listener
  clearBtn.addEventListener("click", clearAllTasks);

  //clear tasks
  function clearAllTasks() {
    let transaction = DB.transaction("tasks", "readwrite");
    let tasks = transaction.objectStore("tasks");
    // clear the table.
    tasks.clear();
    displayTaskList();
    console.log("Tasks Cleared !!!");
  }
});

//Ascending
  function ascending(e) {
    let fetchedTasks = []; // an empty array to fetch and store tasks from the database.

    let tasks = DB.transaction("tasks", "readwrite").objectStore(
      "tasks"
    );

    let allTasks = tasks.getAll(); //get all tasks

    //if getting all tasks is successful, do this
    allTasks.onsuccess = (e) => {
      fetchedTasks = allTasks.result; //store the fetched tasks in the array created above

      //remove current elements
      while (taskList.firstChild) {
        const e = taskList.firstChild;
        e.parentElement.removeChild(e);
      }

      fetchedTasks.reverse(); //reverse the array of objects we stored

      //iterate through the array of tasks and recreate the list elements with the tasks data.
      for (let index = 0; index < fetchedTasks.length; index++) {
        const li = document.createElement("li");
        li.setAttribute("data-task-id", fetchedTasks[index].id);
        li.className = "collection-item";
        li.appendChild(document.createTextNode(fetchedTasks[index].taskname));
        const link = document.createElement("a");
        link.className = "delete-item secondary-content";
        link.innerHTML = `
                     <i class="fa fa-remove"></i>
                    &nbsp;
                    <a href="./edit.html?id=${fetchedTasks[index].id}"><i class="fa fa-edit"></i> </a>
                    `;
        li.appendChild(link);
        taskList.appendChild(li);
      }
    };
  }
  //Descending

  function descending(e) {
    let fetchedTasks = []; // an empty array to fetch and store tasks from the database.
    let tasks = DB.transaction("tasks", "readwrite").objectStore(
      "tasks"
    );

    let allTasks = tasks.getAll(); //get all tasks

    //if getting all tasks is successful, do this
    allTasks.onsuccess = (e) => {
      fetchedTasks = allTasks.result;

      //remove current elements
      while (taskList.firstChild) {
        const e = taskList.firstChild;
        e.parentElement.removeChild(e);
      }

      //Iterate through the array of tasks and recreate the list elements with the tasks data.
      for (let index = 0; index < fetchedTasks.length; index++) {
        const li = document.createElement("li");
        li.setAttribute("data-task-id", fetchedTasks[index].id);
        li.className = "collection-item";
        li.appendChild(document.createTextNode(fetchedTasks[index].taskname));
        const link = document.createElement("a");
        link.className = "delete-item secondary-content";
        link.innerHTML = `
                     <i class="fa fa-remove"></i>
                    &nbsp;
                    <a href="./edit.html?id=${fetchedTasks[index].id}"><i class="fa fa-edit"></i> </a>
                    `;
        li.appendChild(link);
        taskList.appendChild(li);
      }
    };
  }