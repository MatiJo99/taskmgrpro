function TaskItem({ index, task = {}, onCompleteTask, onDeleteTask }) {
  if (!task.id) return null;

  return (
    <li className={`task-item ${task.status || ''}`}>
      {/* Display the index prefix here */}
      <span className="task-number">{index}. </span>
      <span className="task-description">{task.description}</span>

      <div className="task-actions">
        {task.status !== 'completed' && (
          <button
            onClick={() => onCompleteTask(task.id)}
            className="complete-btn"
          >
            complete
          </button>
        )}
        <button
          onClick={() => onDeleteTask(task.id)}
          className="delete-btn"
        >
          delete
        </button>
      </div>
    </li>
  );
}

export default TaskItem;