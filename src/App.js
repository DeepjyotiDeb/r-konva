import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import CropHome from './components/CropHome';
import { CropSelect } from './components/CropSelect';
import { CropType1 } from './components/CropType1';

function App() {
  return (
    <div className='App'>
      <BrowserRouter>
        <nav
          style={{
            borderBottom: 'solid 1px',
            paddingBottom: '1rem',
          }}
        >
          <Link to='/' element={<CropHome />}>
            CropHome
          </Link>{' '}
          |{' '}
          <Link to='/crop-select' element={<CropSelect />}>
            CropSelect
          </Link>{' '}
          |{' '}
          <Link to='/crop-type1' element={<CropType1 />}>
            CropType1
          </Link>
        </nav>
        <Routes>
          {/* <Route path='/' element={<App />} /> */}
          <Route path='/' element={<CropHome />} />
          <Route path='crop-select' element={<CropSelect />} />
          <Route path='crop-type1' element={<CropType1 />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
