import { Component, computed, effect, OnInit, signal } from '@angular/core';
import { FilterType, TodoModel } from '../../models/todo';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent implements OnInit{
  todoList = signal<TodoModel[]>([]);

  filter = signal<FilterType>('all');

  todoListFiltered = computed(()=>{
    const filter = this.filter();
    const todos = this.todoList();

    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed)
      case 'completed':
        return todos.filter((todo) => todo.completed)
      default:
        return todos;
    }
  })

  newTodo = new FormControl('',{
    nonNullable: true,
    validators: [
      Validators.required, 
      Validators.minLength(3)
    ]
  })

  constructor(){
    effect(()=>{
      localStorage.setItem('todos', JSON.stringify(this.todoList()));
    })
  }

  ngOnInit(): void {
    const storage = localStorage.getItem('todos');
    if(storage){
      this.todoList.set(JSON.parse(storage));
    }
  }

  change_filter(filterString: FilterType){
    this.filter.set(filterString);
  }

  add_todo(){
    const newTodoTitle = this.newTodo.value.trim();
    if (this.newTodo.valid && newTodoTitle !== '') {
      this.todoList.update((prev_todos) => {
        return [
          ...prev_todos,
          {
            id: Date.now(),
            title: newTodoTitle,
            completed: false,
          }
        ]
      });
      this.newTodo.reset();
    } else {

    }
  }

  toggle_todo(id: number){
    this.todoList.update((prev_todos) => prev_todos.map((todo) =>      
      todo.id === id 
      ? { ...todo, completed: !todo.completed }
      : { ...todo }))
  }

  removeTodo(id: number){
    this.todoList.update((prev_todos) => prev_todos.filter((item) => item.id !== id))
  }

  toggle_update_todo(id: number){
    this.todoList.update((prev_todos) => prev_todos.map((todo) =>      
      todo.id === id 
      ? { ...todo, editing: true }
      : { ...todo, editing: false }));
  }

  update_todo(id: number, evt: Event){
    const title = (evt.target as HTMLInputElement).value;
    this.todoList.update((prev_todos) => prev_todos.map((item) =>
      item.id == id
      ? { ...item, title: title, editing: false }
      : { ...item }
    ));
  }
}
