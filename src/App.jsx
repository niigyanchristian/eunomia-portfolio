import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<div>Welcome to Eunomia Portfolio</div>} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
