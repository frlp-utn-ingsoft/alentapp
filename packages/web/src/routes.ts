import { createBrowserRouter } from "react-router";
import { MembersView } from "./views/Members";
import { HomeView } from "./views/Home";
import { LockersView } from "./views/Lockers";  // <-- nuevo
import Layout from "./Layout";
import { PaymentsView } from './views/Payments'; // Actualizado al nombre correcto del componente

export let router = createBrowserRouter([
  {
    Component: Layout,
    children: [
      {
        path: "/",
        Component: HomeView,
      },
      {
        path: "/members",
        Component: MembersView,
      },
      {
        path: "/payments",
        Component: PaymentsView,
      },
      { path: "/", Component: HomeView },
      { path: "/members", Component: MembersView },
      { path: "/lockers", Component: LockersView },  // <-- nuevo
    ],
  },
]);