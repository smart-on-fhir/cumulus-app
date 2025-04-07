import { createRoot } from 'react-dom/client'


const ids = ['root', 'modal', 'context-menu'];
ids.forEach((id) => {
    if (!document.getElementById(id)) {
        const el = document.createElement('div');
        el.id = id;
        document.body.appendChild(el);
    }
});

const appRoot = createRoot(document.getElementById('root')!)
const modalRoot = createRoot(document.getElementById("modal")!)
const contextMenuRoot = createRoot(document.getElementById("context-menu")!)

export { appRoot, modalRoot, contextMenuRoot }