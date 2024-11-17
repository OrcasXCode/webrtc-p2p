import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Sender} from './components/Sender';
import {Receiver} from './components/Receiver';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/sender' element={<Sender></Sender>}/>
          <Route path='/receiver' element={<Receiver></Receiver>}/>
        </Routes>
      </BrowserRouter>      
    </>
  )
}

export default App
