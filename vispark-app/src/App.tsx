import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1 className='text-3xl font-bold underline'>
        hah {count}
      </h1>
      <button onClick={() => setCount(count + 1)}>click</button>
    </>
  )
}

export default App
