function AuthForm({
  view,
  email,
  password,
  errors,
  setEmail,
  setPassword,
  onSubmit,
}) {
  return (
    <form onSubmit={(e) => onSubmit(e, view)}>
      <h2>{view === 'login' ? 'Log in' : 'Sign up'}</h2>

      <label>Email</label>
      <input
        type="text"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <div className="error">{errors.email}</div>

      <label>Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <div className="error">{errors.password}</div>

      <button type="submit">{view === 'login' ? 'Log in' : 'Sign up'}</button>
    </form>
  );
}

export default AuthForm;