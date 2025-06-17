import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import CSVUploader from './CSVUploader'
import FileUploader from "./FileUploader"


function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <FileUploader></FileUploader>
      <>Hello</>
    </>
  )
}

export default App
