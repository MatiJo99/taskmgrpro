function Home({ onGetStarted }) {
  return (
    <header>
      <h2>Task Manager</h2>
      <h3>Organize Your Work Efficiently</h3>
      <button onClick={onGetStarted} className="btn">
        Get Started
      </button>
    </header>
  );
}

export default Home;