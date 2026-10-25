const cl = console.log;

const tform = document.getElementById('tform')
const tinput = document.getElementById('tinput')
const addbtn = document.getElementById('addbtn')
const updatebtn = document.getElementById('updatebtn')
const todocontainer = document.getElementById('todocontainer')
const spinner = document.getElementById('spinner')


const Base_Url = `https://crud-dfd04-default-rtdb.firebaseio.com/`
const todo_Url = `${Base_Url}todos.json`


const state = {
    todosArr : [],
    edit_todoId : null,
}

function objToArr(obj){
    for(const key in obj){
        obj[key].id = key;
        state.todosArr.unshift(obj[key])
    }
}

function handleSpinner(flag){
    if(flag){
        spinner.classList.remove('d-none')
    }else{
        spinner.classList.add('d-none')
    }
}

function snackBar(msg,icon){
    Swal.fire({
        title:msg,
        timer:3000,
        icon:icon,
    })
}

function templiting(arr){
    let result = ``;
    arr.forEach((t)=>{
        result += ` 
                   <li id="${t.id}" class="list-group-item d-flex justify-content-between mt-4 bg-dark">
                        <strong class="text-white">${t.todoitem}</strong>
                       <div>
                        <button onclick="onedit(this)" class="btn btn-sm btn-warning">Edit</button>
                        <button onclick="ondelete(this)" class="btn btn-sm btn-warning">Delete</button>
                       </div>
                    </li>`

    })
       todocontainer.innerHTML = result;
}

function fetchtodo(){
    handleSpinner(true)
    fetch(todo_Url,{
        method:"GET",
        headers:{
            "Content-type":"application/json",
            "auth":"token JWT from Ls"
        }
    })
    .then(res=>{
        if(!res.ok){
            throw new Error()
        }
        return res.json()
    })
    .then(data=>{
        objToArr(data)
        templiting(state.todosArr)
    })
    .catch(err=>{
        cl('error..')
    })
    .finally(()=>{
        handleSpinner()
    })
}
fetchtodo()

//create

function onAddtodo(eve){
    eve.preventDefault()
    let newObj ={
        todoitem:tinput.value
    }
    handleSpinner(true)
    fetch(todo_Url,{
        method:"POST",
        body:JSON.stringify(newObj),
        headers:{
            "Content-type" :"application/json",
            "auth":"token JWT form Ls"
        }
    })
    .then(res=>{
        if(!res.ok){
            throw new Error()
        }
        return res.json()
    })
    .then(data=>{
        newObj.id = data.name;
        state.todosArr.unshift(newObj)

        tform.reset()
        templiting(state.todosArr)
        snackBar(" New Todo Created Successfully!!","success")
    })
    .catch(err=>{
        snackBar('err','error')
        cl(err)
    })
    .finally(()=>{
        handleSpinner()
    })
}
//edit

function onedit(ele){
    let editId = ele.closest('li').id
    state.edit_todoId = editId

    let editobj = state.todosArr.find(t=>t.id=== editId)

    tinput.value = editobj.todoitem
    addbtn.classList.add("d-none")
    updatebtn.classList.remove("d-none")
}

//update

function onupdate(eve){
    let updateId = state.edit_todoId
    state.edit_todoId = null
    let updateUrl = `${Base_Url}todos/${updateId}.json`
    let updateObj = {
        todoitem : tinput.value,
        id:updateId
    }
     handleSpinner(true)
    fetch(updateUrl,{
        method:"PATCH",
        body:JSON.stringify(updateObj),
        headers:{
            "Content-type" :"application/json",
            "auth":"token JWT form Ls"
        }
    })
    .then(res=>{
        if(!res.ok){
            throw new Error()
        }
        return res.json()
    })
    .then(data=>{
        let getIndex = state.todosArr.findIndex(t=>t.id === updateId)
        state.todosArr[getIndex] = updateObj

        templiting(state.todosArr)
        tform.reset()

        addbtn.classList.remove("d-none")
        updatebtn.classList.add("d-none")

        snackBar("Updated Successfully  !!","success")
    })
    .catch(err=>{
        snackBar("Error....",'error')
    })
    .finally(()=>{
        handleSpinner()
    })

}

//delete

function ondelete(ele){
    let removeId = ele.closest('li').id
    let removeurl = `${Base_Url}todos/${removeId}.json`
    Swal.fire({
            title: "Are you sure?",
            text: "You want to delete this todo!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!"
        }).then((result)=>{
            if(result.isConfirmed){
                handleSpinner(true)
                fetch(removeurl,{
                    method:"DELETE",
                    body:null,
                    headers:{
                        "Content-type" :"application/json",
                        "auth":"token JWT form Ls"
                    }
                })
                .then(res=>{
                if(!res.ok){
                throw new Error()
                }
               return res.json()
                })
                .then(data=>{
                    cl(data)
                    let getIndex = state.todosArr.findIndex(t=>t.id === removeId)
                    state.todosArr.splice(getIndex,1)
                    ele.closest('li').remove()
                    snackBar("Deleted Successfully!",'success')
                })
                .catch(err=>{
                    snackBar(err)
                })
                .finally(()=>{
                    handleSpinner()
                })
            }
        })
}

tform.addEventListener("submit",onAddtodo)
updatebtn.addEventListener("click",onupdate)