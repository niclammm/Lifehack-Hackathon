import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CSVUploader from './CSVUploader'


function App() {
  const [count, setCount] = useState(0)
  const  [testData, setTestData] = useState("")
  const fetchTestData = async () => {
    try {
          const response = await fetch('http://localhost:5000/test');
          const data = await response.json();
          setTestData(data["message"])
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    fetchTestData()
  }, [])
  
  return (
    <>
      {/* <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p> */}
      <CSVUploader></CSVUploader>
      <>Hello</>
      <p>{testData}</p>
    </>
  )
}

export default App
