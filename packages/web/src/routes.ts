import { createBrowserRouter } from "react-router";
import { MembersView } from "./views/Members";
import { DisciplinesView } from "./views/Disciplines";
import { SportsView } from "./views/Sports";
import { HomeView } from "./views/Home";
import { PaymentsView } from "./views/Payments";
import Layout from "./Layout";

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
      {
        path: "/disciplines",
        Component: DisciplinesView,
      },
      {
        path: "/sports",
        Component: SportsView,
      },
    ],
  },
]);