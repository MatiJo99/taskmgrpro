import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './components/Home';
import AuthForm from './components/AuthForm';
import TaskDashboard from './components/TaskDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [view, setView] = useState('home');

  useEffect(() => {
    fetch('/user-status', {
      credentials: 'include',
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
        credentials: 'include',
      })
        .then(res => {
          if (res.status === 401) throw new Error('Unauthorized');
          return res.json();
        })
        .then(data => {
          setTasks(Array.isArray(data) ? data : []);
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
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
      credentials: 'include',
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ description: newTask }),
    });

    const task = await res.json();
    setTasks([...tasks, task]);
    setNewTask('');
  };

  const handleCompleteTask = async (id) => {
    const res = await fetch(`/tasks/${id}/complete`, {
      method: 'PUT',
      credentials: 'include',
    });

    const updatedTask = await res.json();
    setTasks(tasks.map(t => (t.id === id ? updatedTask : t)));
  };

  const handleDeleteTask = async (id) => {
    await fetch(`/tasks/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    setTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div>
      <Navbar
        user={user}
        onLogout={handleLogout}
        onNavigate={setView}
      />

      <div className="main-content">
        {view === 'home' && (
          <Home onGetStarted={() => setView(user ? 'tasks' : 'login')} />
        )}

        {(view === 'login' || view === 'signup') && (
          <AuthForm
            view={view}
            email={email}
            password={password}
            errors={errors}
            setEmail={setEmail}
            setPassword={setPassword}
            onSubmit={handleAuth}
          />
        )}

        {view === 'tasks' && (
          <TaskDashboard
            tasks={tasks}
            newTask={newTask}
            setNewTask={setNewTask}
            onAddTask={handleAddTask}
            onCompleteTask={handleCompleteTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
      </div>
    </div>
  );
}

export default App;