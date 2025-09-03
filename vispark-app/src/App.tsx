import { Button } from "antd"
import { useState } from "react"
import { CenterDiv } from "./modules/common"

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="w-full h-[100dvh] bg-zinc-900">
      <CenterDiv>
        <h1 className="text-3xl text-white font-bold underline">
          youtube channels
        </h1>
        <Button onClick={() => setCount(count + 1)}>subscribe</Button>
        <Button onClick={() => setCount(count + 1)}>unsubscribe</Button>
      </CenterDiv>
    </div>
  )
}

export default App
