import React, { useState, useEffect } from 'react';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [view, setView] = useState('home'); // 'home', 'login', 'signup', 'tasks'

  useEffect(() => {
    // UPDATED: Removed /api prefix
    fetch('/user-status', {
    credentials: 'include'
        })
      .then(res => res.json())
      .then(data => {
        if (data.loggedIn) {
          setUser(data.email);
          setView('tasks');
        }
      });
  }, []);

  useEffect(() => {
    if (view === 'tasks') {
      fetch('/tasks', {
    credentials: 'include'
    })
        .then(res => {
          if (res.status === 401) throw new Error('Unauthorized');
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) {
            setTasks(data);
          } else {
            setTasks([]); 
          }
        })
        .catch(() => { 
          setUser(null); 
          setTasks([]); 
          setView('login'); 
        });
    }
  }, [view]);

  const handleAuth = async (e, endpoint) => {
    e.preventDefault();
    setErrors({ email: '', password: '' });
    
    const res = await fetch(`/${endpoint}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        email,
        password
    })
  });
    const data = await res.json();
    
    if (data.errors) {
      setErrors(data.errors);
    } else if (data.user) {
      setUser(email);
      setView('tasks');
    }
  };

  const handleLogout = async () => {
    await fetch('/logout', {
    credentials: 'include'
    });
    setUser(null);
    setView('home');
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    const res = await fetch('/tasks', {
    method: 'POST',
    credentials: 'include',
      body: JSON.stringify({ description: newTask }),
      headers: { 'Content-Type': 'application/json' }
    });
    const task = await res.json();
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const handleCompleteTask = async (id) => {
    const res = await fetch(`/tasks/${id}/complete`, {
    method: 'PUT',
    credentials: 'include'
    });
    const updatedTask = await res.json();
    setTasks(tasks.map(t => t.id === id ? updatedTask : t));
  };

  const handleDeleteTask = async (id) => {
    await fetch(`/tasks/${id}`, {
    method: 'DELETE',
    credentials: 'include'
    });
    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div>
      <nav>
        <h1><button className="nav-logo" onClick={() => setView(user ? 'tasks' : 'home')}>Task Manager</button></h1>
        <ul>
          {user ? (
            <>
              <li>Welcome, {user}</li>
              <li><button onClick={handleLogout} className="btn-link">Log out</button></li>
            </>
          ) : (
            <>
              <li><button onClick={() => setView('login')} className="btn-link">Log in</button></li>
              <li><button onClick={() => setView('signup')} className="btn">Sign up</button></li>
            </>
          )}
        </ul>
      </nav>

      <div className="main-content">
        {view === 'home' && (
          <header>
            <h2>Task Manager</h2>
            <h3>Organize Your Work Efficiently</h3>
            <button onClick={() => setView(user ? 'tasks' : 'login')} className="btn">Get Started</button>
          </header>
        )}

        {(view === 'login' || view === 'signup') && (
          <form onSubmit={(e) => handleAuth(e, view)}>
            <h2>{view === 'login' ? 'Log in' : 'Sign up'}</h2>
            <label>Email</label>
            <input type="text" value={email} onChange={e => setEmail(e.target.value)} required />
            <div className="error">{errors.email}</div>
            
            <label>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            <div className="error">{errors.password}</div>
            
            <button type="submit">{view === 'login' ? 'Log in' : 'Sign up'}</button>
          </form>
        )}

        {view === 'tasks' && (
          <div className="tasks-container">
            <h2>Your Dashboard</h2>
            <form onSubmit={handleAddTask} className="task-form">
              <input value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Type a new task task..." required />
              <button type="submit">Add Task</button>
            </form>
            <ul className="task-list">
              {tasks.map(task => (
                <li key={task.id} className={`task-item ${task.status}`}>
                  <span>{task.description}</span>
                  <div className="task-actions">
                    {task.status !== 'completed' && (
                      <button onClick={() => handleCompleteTask(task.id)} className="complete-btn">✓</button>
                    )}
                    <button onClick={() => handleDeleteTask(task.id)} className="delete-btn">✗</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;