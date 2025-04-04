import { createRoot } from 'react-dom/client'
import App            from './components/App'

const appRoot = createRoot(document.getElementById('root')!)
const modalRoot = createRoot(document.getElementById("modal")!)
const contextMenuRoot = createRoot(document.getElementById("context-menu")!)


appRoot.render(
  // <React.StrictMode>
    <App />,
  // </React.StrictMode>
);


if (import.meta.hot) {
    import.meta.hot.accept();
}

export { appRoot, modalRoot, contextMenuRoot }