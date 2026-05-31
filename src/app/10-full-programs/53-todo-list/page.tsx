"use client";

import { Solution } from "@/components";
import { useSyncExternalStore, useState } from "react";
import { Button, Grid, Input, List } from "semantic-ui-react";

const STORAGE_KEY = "efp-todo-list";

type Task = { id: number; text: string };

const EMPTY_TASKS: Task[] = [];
let _todoListeners: Array<() => void> = [];
let _todoCache: Task[] | null = null;

const todoStore = {
  subscribe: (listener: () => void) => {
    if (_todoCache === null) {
      const stored = localStorage.getItem(STORAGE_KEY);
      _todoCache = stored !== null ? JSON.parse(stored) : [];
    }
    _todoListeners.push(listener);
    return () => { _todoListeners = _todoListeners.filter((l) => l !== listener); };
  },
  getSnapshot: (): Task[] => _todoCache ?? EMPTY_TASKS,
  getServerSnapshot: (): Task[] => EMPTY_TASKS,
  set: (tasks: Task[]) => {
    _todoCache = tasks;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    _todoListeners.forEach((l) => l());
  },
};

const TodoList = () => {
  const tasks = useSyncExternalStore(todoStore.subscribe, todoStore.getSnapshot, todoStore.getServerSnapshot);
  const [input, setInput] = useState("");

  const addTask = () => {
    const text = input.trim();
    if (!text) return;
    todoStore.set([...tasks, { id: Date.now(), text }]);
    setInput("");
  };

  const removeTask = (id: number) =>
    todoStore.set(tasks.filter((t) => t.id !== id));

  return (
    <Solution category="Full Programs" exercise="Todo List"
      markdown="/exercises/10-full-programs/53-todo-list.md"
    >
      <Grid stackable>
        <Grid.Column width={12}>
          <Input
            fluid
            placeholder="Enter a task..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") addTask(); }}
          />
        </Grid.Column>
        <Grid.Column width={4}>
          <Button primary fluid disabled={!input.trim()} onClick={addTask}>
            Add Task
          </Button>
        </Grid.Column>
        <Grid.Column width={16}>
          {tasks.length === 0 ? (
            <p style={{ color: "#999" }}>No tasks yet. Add one above.</p>
          ) : (
            <List divided relaxed>
              {tasks.map((task) => (
                <List.Item key={task.id}>
                  <List.Content floated="right">
                    <Button size="small" negative onClick={() => removeTask(task.id)}>
                      Complete
                    </Button>
                  </List.Content>
                  <List.Content>
                    <List.Description style={{ lineHeight: "2.2em" }}>{task.text}</List.Description>
                  </List.Content>
                </List.Item>
              ))}
            </List>
          )}
        </Grid.Column>
      </Grid>
    </Solution>
  );
};

export default TodoList;
