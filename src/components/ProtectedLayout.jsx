import { Outlet, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedLayout() {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <div className="navbar bg-base-100 shadow-xl rounded-box mb-4">
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost text-xl">Task Manager</Link>
          {user?.role === 'admin' && (
            <Link to="/admin/dashboard" className="btn btn-ghost ml-4">
              Admin Dashboard
            </Link>
          )}
        </div>
        <div className="flex-none gap-4 items-center">
          <label className="label cursor-pointer mx-2 mt-3">
            <span className="label-text mr-2">Dark Mode</span>
            <input
              type="checkbox"
              className="toggle"
              checked={theme === 'dark'}
              onChange={toggleTheme}
            />
          </label>
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img alt="User" src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}`} />
              </div>
            </div>
            <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
              <li><a>Role: {user?.role || 'user'}</a></li>
              <li><button onClick={logout}>Logout</button></li>
            </ul>
          </div>
          <span className="font-medium ml-3">{user?.name || 'User'}</span>
        </div>
      </div>
      <Outlet />
    </div>
  )
}
