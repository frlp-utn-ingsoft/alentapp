import { createBrowserRouter } from "react-router";

import { MembersView } from "./views/Members";
import { PaymentsView } from "./views/Payments";
import { SportsView } from "./views/Sport";
import { HomeView } from "./views/Home";
import Layout from "./Layout";
import { LockersView } from "./views/Lockers";
import { DisciplinesView } from "./views/Disciplines";

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
        path: "/sports",
        Component: SportsView,
      },
       {
        path: "/lockers",
        Component: LockersView,
      },
       {
        path: "/disciplines",
        Component: DisciplinesView,
      }
    ],
  },
]);
     
