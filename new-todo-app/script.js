// ToDo App 2.0 - with API

// Prevent reload of DOM due to "Submit"
document.body.addEventListener("submit", (event) => {
  event.preventDefault();
});

//API for ToDos
const apiUrl = "http://localhost:4730/todos/";

//Local Storage for ToDos
let todoList = [];

//Variables for accessing inputs from DOM
const list = document.querySelector("#list");
const btnAddTodo = document.querySelector("#btn-add-todo");
const inputBox = document.querySelector("#input-box");

//Load todoList from API
function loadTodoList() {
  fetch(apiUrl)
    //Check if network response is ok
    .then((response) => {
      if (!response.ok) {
        alert(
          "There is a network error, can't load ToDo list. Do not forget to buy coffee."
        );
      }
      return response.json();
    })
    //Check if API list is empty and add a default
    .then((todosFromApi) => {
      if (todosFromApi.length > 0) {
        todoList = todosFromApi;
        renderTodoList(todoList);
      } else {
        if (todoList.length === 0) {
          addStickyTodo();
        }
      }
    });
}

//Render initial TodoList
loadTodoList();

//Capture the button clicks
btnAddTodo.addEventListener("click", addNewTodo);
list.addEventListener("change", checkCheckbox);

//Add sticky todo if list is empty
function addStickyTodo() {
  const stickyTodo = {
    description: "Sticky ToDo: Do NOT Forget to buy COFFEE!",
    done: false,
  };
  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stickyTodo),
  })
    .then((response) => response.json())
    .then((stickyFromApi) => {
      todoList.push(stickyFromApi);
      renderTodoList(todoList);
    });
}

//Create new todos in API
function addNewTodo() {
  //Retrieve trimmed input from text field
  const textInput = inputBox.value.trim();
  //if input === empty -> give out warning
  if (textInput === "") {
    alert("I would appreciate if you entered something.");
    return;
  }
  //Collect data for new Todo
  const newTask = {
    description: textInput,
    done: false,
  };
  //Check for duplicates
  let isDuplicate = false;
  todoList.forEach((todo) => {
    if (todo.description.toLowerCase() === textInput.toLowerCase()) {
      isDuplicate = true;
      return;
    }
  });
  if (isDuplicate) {
    alert("No duplicate Todo's please.");
    return;
  }
  //Post new todo to API
  fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTask),
  })
    .then((response) => response.json())
    .then((newTodoFromApi) => {
      todoList.push(newTodoFromApi);
      renderTodoList(todoList);
    });

  //Reset input text field
  inputBox.value = null;
  inputBox.focus();
}

// Filter todos
const filters = document.querySelector("#filters");
filters.addEventListener("change", filterTodos);

function filterTodos(event) {
  // Capture value of radiobutton
  const filterValue = event.target.value;

  // Filter todoList based on radio button value
  let filteredList = [];
  if (filterValue === "open") {
    filteredList = todoList.filter(function (todo) {
      return todo.done === false;
    });
  } else if (filterValue === "done") {
    filteredList = todoList.filter(function (todo) {
      return todo.done === true;
    });
  } else {
    filteredList = todoList;
  }
  renderTodoList(filteredList);
}

//Check the checkboxes if checked or unchecked. Check.
function checkCheckbox(event) {
  //Find out which checkbox is active
  const checkedBox = event.target;
  //Find out with <li> is involved
  const liElement = checkedBox.parentElement;
  //Connect checkbox event with todoobject in array
  const todo = liElement.todoObj;
  //Update the object when the box is checked
  todo.done = checkedBox.checked;
  updateTodoList(todo.id, todo);
}

//remove done todos in API
const removes = document.querySelector("#removeTodos");
removes.addEventListener("click", removeTodos);

function removeTodos() {
  // Filter out the todos that are done
  const doneTodos = todoList.filter((todo) => {
    return todo.done;
  });
  // Package and delete todos from API
  Promise.all(
    doneTodos.map((todo) => {
      fetch(apiUrl + todo.id, {
        method: "DELETE",
      }).then((response) => {
        if (!response.ok) {
          alert("Problem okay? Yay okay?!");
        }
      });
    })
  )
    // Update working todoList to remove to not re-render deleted todos
    .then(() => {
      todoList = todoList.filter((todo) => !todo.done);
      if (todoList.length === 0) {
        loadTodoList();
      } else {
        renderTodoList(todoList);
      }
    });
}

//Update checked status of todos in API
function updateTodoList(todoId, updatedCheckbox) {
  const updateUrl = apiUrl + todoId;
  fetch(updateUrl, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedCheckbox),
  })
    .then((response) => response.json())
    .then((updatedTodoFromApi) => {
      const todoIndex = todoList.findIndex(
        (todo) => todo.id === updatedTodoFromApi.id
      );
      todoList[todoIndex] = updatedTodoFromApi;
      loadTodoList();
    });
}

//Update rendered list
function renderTodoList(randomList) {
  //Clear list before updating
  list.innerHTML = "";
  //Loop the list inserted into function to find everything
  randomList.forEach((todo) => {
    //Create list element
    const todoLi = document.createElement("li");
    //Connect current todo to current <li> for use later in code
    todoLi.todoObj = todo;
    //Create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "todo-" + todo.id;
    checkbox.checked = todo.done;
    todoLi.appendChild(checkbox);
    //Create label for checkbox
    const descLabel = document.createElement("label");
    descLabel.htmlFor = checkbox.id;
    descLabel.innerText = todo.description;
    todoLi.appendChild(descLabel);
    //Add text and check to <li>
    list.appendChild(todoLi);
  });
}
