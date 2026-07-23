import TaskList from './TaskList';

function TaskDashboard({
  tasks,
  newTask,
  setNewTask,
  onAddTask,
  onCompleteTask,
  onDeleteTask,
}) {
  return (
    <div className="tasks-container">
      <h2>Your Dashboard</h2>

      <form onSubmit={onAddTask} className="task-form">
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Type a new task..."
          required
        />
        <button type="submit">Add Task</button>
      </form>

      <TaskList
        tasks={tasks}
        onCompleteTask={onCompleteTask}
        onDeleteTask={onDeleteTask}
      />
    </div>
  );
}

export default TaskDashboard;