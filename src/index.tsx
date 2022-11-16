import ReactDOM from 'react-dom/client';
import './index.css';

import BirdApp from './bird_app'

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <BirdApp/>
  );
} 