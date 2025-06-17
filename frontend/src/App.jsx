import { useState, useEffect } from 'react'

// import './App.css'
import CSVUploader from './CSVUploader'
import FileUploader from './FileUploader'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

      <FileUploader/>
      <>Hello</>
    </>
  )
}

export default App
