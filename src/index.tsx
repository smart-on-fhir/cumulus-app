import App         from './components/App'
import { appRoot } from "./roots"

appRoot.render(
  // <React.StrictMode>
    <App />,
  // </React.StrictMode>
);

if (import.meta.hot) {
    import.meta.hot.accept();
}
