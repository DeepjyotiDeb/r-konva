import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './App.css';
import CropHome from './components/CropHome';
import { CropSelect } from './components/CropSelect';
import { CropType1 } from './components/CropType1';
import { KonvaCropper } from './components/KonvaCropper1';
import { DragOnly } from './components/OriginalDrag/DragOnly';

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
            DrawOnly
          </Link>{' '}
          |{' '}
          <Link to='/crop-select' element={<CropSelect />}>
            CropSelect
          </Link>{' '}
          |{' '}
          <Link to='/crop-type1' element={<CropType1 />}>
            CropType1
          </Link>{' '}
          |{' '}
          <Link to='/drag-only' element={<DragOnly />}>
            DragOnly
          </Link>
          |{' '}
          <Link to='/konvaCropper' element={<KonvaCropper />}>
            Konva
          </Link>
        </nav>
        <Routes>
          {/* <Route path='/' element={<App />} /> */}
          <Route path='/' element={<CropHome />} />
          <Route path='crop-select' element={<CropSelect />} />
          <Route path='crop-type1' element={<CropType1 />} />
          <Route path='drag-only' element={<DragOnly />} />
          <Route path='konvaCropper' element={<KonvaCropper />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
