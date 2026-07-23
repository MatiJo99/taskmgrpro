function Navbar({ user, onLogout, onNavigate }) {
  return (
    <nav>
      <h1>
        <button
          className="nav-logo"
          onClick={() => onNavigate(user ? 'tasks' : 'home')}
        >
          Task Manager
        </button>
      </h1>

      <ul>
        {user ? (
          <>
            <li>Welcome, {user}</li>
            <li>
              <button onClick={onLogout} className="btn-link">
                Log out
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <button onClick={() => onNavigate('login')} className="btn-link">
                Log in
              </button>
            </li>
            <li>
              <button onClick={() => onNavigate('signup')} className="btn">
                Sign up
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}

export default Navbar;