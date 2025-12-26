import ReactDOM from 'react-dom/client';
import App from './App.tsx';   // 拡張子 .tsx を付ける
import './index.css';          // Vite が作った基本スタイル

const rootElement = document.getElementById('root') as HTMLElement;
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
