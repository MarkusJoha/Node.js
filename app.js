const express = require('express');
const app = express();
const port = 3000;
const bodyParser = require('body-parser');
const fs = require('fs');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.json());

// Read tasks from the JSON file
let tasks = [];
try {
  const tasksData = fs.readFileSync('tasks.json', 'utf-8');
  tasks = JSON.parse(tasksData);
} catch (error) {
  console.error('Error reading tasks file:', error.message);
}

// Welcome message and task list for the root URL
app.get('/', (req, res) => {
  res.render('index', { tasks });
});

// Get all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// Get a single task
app.get('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  res.json(task);
});

// Add a new task (render the form)
app.get('/add', (req, res) => {
  res.render('add');
});

// Process the form and add a new task
app.post('/add', (req, res) => {
  const newTask = {
    id: tasks.length + 1,
    title: req.body.title,
    completed: false
  };

  tasks.push(newTask);
  saveTasksToFile(); // Save tasks to the JSON file
  res.redirect('/');
});

// Mark a task as completed
app.post('/complete/:id', (req, res) => {
  console.log('Received POST request to /complete/:id');
  const taskId = parseInt(req.params.id);
  const task = tasks.find(task => task.id === taskId);

  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  task.completed = true;
  saveTasksToFile(); // Save tasks to the JSON file
  res.redirect('/');
});

// Remove a task
app.post('/remove/:id', (req, res) => {
  const taskId = parseInt(req.params.id);
  tasks = tasks.filter(task => task.id !== taskId);
  saveTasksToFile(); // Save tasks to the JSON file
  res.redirect('/');
});

// Save tasks to the JSON file
function saveTasksToFile() {
  fs.writeFileSync('tasks.json', JSON.stringify(tasks, null, 2), 'utf-8');
}

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
