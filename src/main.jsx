import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { ProfileProvider } from './context/ProfileContext'
import { ProjectsProvider } from './context/ProjectsContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ProfileProvider>
        <ProjectsProvider>
          <App />
        </ProjectsProvider>
      </ProfileProvider>
    </AuthProvider>
  </React.StrictMode>,
)
