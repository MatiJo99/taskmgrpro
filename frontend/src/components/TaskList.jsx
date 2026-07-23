import TaskItem from './TaskItem';

function TaskList({ tasks = [], onCompleteTask, onDeleteTask }) {
  return (
    <ol className="task-list">
      {tasks.filter(Boolean).map((task, index) => (
        <TaskItem
          key={task.id}
          index={index + 1} // Pass the 1-based number down
          task={task}
          onCompleteTask={onCompleteTask}
          onDeleteTask={onDeleteTask}
        />
      ))}
    </ol>
  );
}

export default TaskList;