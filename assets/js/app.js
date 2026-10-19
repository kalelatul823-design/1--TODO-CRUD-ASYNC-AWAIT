let cl = console.log;

let BASE_URL = "https://async-await-fetch-ddfb2-default-rtdb.asia-southeast1.firebasedatabase.app";

let TODO_URL = `${BASE_URL}/todo.json`;

let todoForm = document.getElementById("todoForm");
let todoItemControl = document.getElementById("todoItem");
let isCompletedControl = document.getElementById("isCompleted");
let spinner = document.getElementById("spinner");
let todoInfo = document.getElementById("todoInfo");
let submitBtn = document.getElementById("submitBtn");
let updateBtn = document.getElementById("updateBtn");
let todoHeading = document.getElementById("todoHeading")


//state
let state = {
    todoArr: [],
    editId : null,
}

//spinner
function showHideSpinner(ele){
    if(ele){
        spinner.classList.remove("d-none")
    }else{
        spinner.classList.add("d-none")
    }
}

//snackBar
function snackBar(msg, icon){
    Swal.fire({
        title : msg,
        icon : icon,
        timer : 3000,
    })
}


//objToArr
function objToArr(obj){
    let arr = Object.entries(obj);
    let arr2 = arr.map((todo)=>{
        todo[1].id = todo[0]
        state.todoArr.push(todo[1])
        cl(state.todoArr);
    })
}

//create
async function onAddTodo(eve){
    eve.preventDefault();
    showHideSpinner(true)
    try{
        let newObj = {
       todoItem : todoItemControl.value,
       isCompted : isCompletedControl.value === "yes" ? true : false
    }
   let res = await fetch(TODO_URL,{
        method : "POST",
        body : JSON.stringify(newObj),
        headers : {
            "content-type" : "application/json",
            "Authrization" : "JWT TOKEN"
        }
    })
    let data = await res.json();
    cl(data)
    newObj.id = data.name;
    state.todoArr.push(newObj);
    let li = document.createElement("li");
    li.id = newObj.id
    li.className = `list-group-item d-flex justify-content-between`;
    li.innerHTML = `<div>
                    <input type="checkbox" ${newObj.isCompted ? "checked" : ""} />
                    <strong>${newObj.todoItem}</strong>
                  </div>
                  <div>
                    <i onclick="onEdit(this)"
                      class="fa-solid fa-pen-to-square fa-2x text-primary"
                      role="button"
                    ></i>
                    <i onclick="onRemove(this)"
                      class="fa-solid fa-trash fa-2x text-danger"
                      role="button"
                    ></i>
                  </div>`
                  todoInfo.append(li)
                  todoForm.reset();
                  snackBar(`Todo Addded Successfully`, `success`)
    }
    catch{
    snackBar("Something went wrong")
    }
    finally{
showHideSpinner(false)
    }
    
}


//read
async function showUi(){
    showHideSpinner(true)
    try{
    let res = await fetch(TODO_URL,{
        method : "GET",
        body: null,
        headers : {
            "content-type" : "application/json",
            "Authrization" : "JWT TOKEN"
        }
      })
      if(!res.ok){
        throw new Error()
      }
        let data = await res.json();
        cl(data)
         objToArr(data);
         renderingUi(state.todoArr);
    }catch{
      snackBar("Something went wrong")
    }finally{
      showHideSpinner(false)
    }
}


//templeting
function renderingUi(arr){
    let result = "";
    arr.forEach((ele)=>{
        result += `<li class="list-group-item d-flex justify-content-between" id="${ele.id}">
                  <div>
                    <input type="checkbox" ${ele.isCompted ? "checked" : ""}/>
                    <strong>${ele.todoItem}</strong>
                  </div>
                  <div>
                    <i onclick="onEdit(this)"
                      class="fa-solid fa-pen-to-square fa-2x text-primary"
                      role="button"
                    ></i>
                    <i onclick="onRemove(this)"
                      class="fa-solid fa-trash fa-2x text-danger"
                      role="button"
                    ></i>
                  </div>
                </li>`
    })
    todoInfo.innerHTML = result;
}


showUi()

//edit
function onEdit(ele){
    let editId = ele.closest("li").id;
    state.editId = editId;
    let editObj = state.todoArr.find((ele)=> ele.id === editId);
    todoItemControl.value = editObj.todoItem;
    isCompletedControl.value = editObj.isCompted ? "yes" : "no";
  
    submitBtn.classList.add("d-none");
    updateBtn.classList.remove("d-none");
    todoHeading.innerText = "Update Todo"

}

//updateTodo
async function onUpdateTodo(event){
  showHideSpinner(true)
  try{
    let updateId = state.editId;
    let UPDATE_URL = `${BASE_URL}/todo/${updateId}.json`;
    let updateObj = {
      todoItem : todoItemControl.value,
       isCompted : isCompletedControl.value === "yes" ? true : false
    };
    let res = await fetch(UPDATE_URL,{
      method : "PATCH",
      body : JSON.stringify(updateObj),
      headers : {
        "content-type" : "application/json",
        "Authorization" : "JWT TOKEN"
      }
    })
    if(!res.ok){
      throw new Error()
    }
    let data = await res.json();
    cl(data)
    let getIndex = state.todoArr.findIndex(ele => ele.id === updateId);
    state.todoArr[getIndex] = updateObj;
    let li = document.getElementById(updateId)
    li.innerHTML = `
                  <div>
                    <input type="checkbox" ${updateObj.isCompted ? "checked" : ""}/>
                    <strong>${updateObj.todoItem}</strong>
                  </div>
                  <div>
                    <i onclick="onEdit(this)"
                      class="fa-solid fa-pen-to-square fa-2x text-primary"
                      role="button"
                    ></i>
                    <i onclick="onRemove(this)"
                      class="fa-solid fa-trash fa-2x text-danger"
                      role="button"
                    ></i>
                  </div>
    `
    updateBtn.classList.add("d-none");
    submitBtn.classList.remove("d-none");
    todoHeading.innerText =  "Add Todo"
    snackBar(`Todo Updated Successfully`, `success`)
    todoForm.reset();
    state.editId = null
  }catch{
  snackBar("something went wrong")
  }finally{
   showHideSpinner(false)
  }

}


//remove 
 async function onRemove(ele){
  
  let removeId = ele.closest("li").id;
    let result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to revert this!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!"
  })
  if (result.isConfirmed) {
    showHideSpinner(true)
    try{
      let REMOVE_URL = `${BASE_URL}/todo/${removeId}.json`;
    let res =  await fetch(REMOVE_URL,{
      method : "DELETE",
      body : null,
      headers : {
        "content-type" : "application/json",
        "Authrization" : "JWT TOKEN"
      }
     })
     if(!res.ok){
      throw new Error()
     }
      let data = await res.json()
      cl(data)
      let getIndex = state.todoArr.findIndex(ele => ele.id === removeId);
      state.todoArr.splice(getIndex, 1)
      ele.closest("li").remove()
      snackBar(`Todo Deleted Successfully`, `success`)
    }catch{
      snackBar("something went wrong")
    }
    finally{
       showHideSpinner(false)
    }
  }
}

todoForm.addEventListener('submit', onAddTodo)
updateBtn.addEventListener("click", onUpdateTodo)