var storage_key= "todos"
var storageTodo = {
  fetch: function () {  
    var data = JSON.parse(localStorage.getItem(storage_key) || '[]')
    return data
  },
  save: function (data) {  
    localStorage.setItem(storage_key,JSON.stringify(data))
  }
}

var statusTodo = {
  all: function (todos) { 
    return todos
  },
  active: function (todos) {  
    return todos.filter(function (todo) {
      return !todo.completed
    })
  }
}

var vm = new Vue({
  el: "#app",
  data:{
    title: "todos",
    todos: storageTodo.fetch(),
    newTodo: "",
    tag: null,
  },
  watch: {
    todos:{
      handler: function (todos) {  
        storageTodo.save(todos)
      },
      deep: true
    }
  },
  computed: {
    remaining: function () {  
      return statusTodo.active(this.todos).length
    }
  },
  filters: {
    pluralize: function (n) {  
      return (n===1)? "item":"items" 
    }
  },
  methods: {
    addTodo: function () {  
      this.tag = null
      if (!this.newTodo.trim()) { 
        this.newTodo=""
        return
      }
      this.todos.push({content: this.newTodo, completed: false})
      this.newTodo=""
    },
    deleteTodo: function (id) {  
      this.todos.splice(id,1)
    },
    show: function (value) {  
      if (value===null)
        this.tag= value
      else
        this.tag=!value
    },
    checkAll: function () {  
      this.todos.forEach(function (todo) {  
        todo.completed = true
      })
    },
    deleteCompleted: function () {  
      this.todos = statusTodo.active(this.todos)
    }
  }
})