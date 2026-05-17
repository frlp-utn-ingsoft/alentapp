import { createBrowserRouter } from "react-router";

import { MembersView } from "./views/Members";
import { LockersView } from "./views/Lockers";
import { HomeView } from "./views/Home";
import Layout from "./Layout";
import { MembersView } from "./views/Members";
import { DisciplinesView } from "./views/Disciplines";
import { PaymentsView } from "./views/Payments";
import { HomeView } from "./views/Home";
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
        path: "/lockers",
        Component: LockersView,
      },
    ],
  },
]);
      {
        path: "/members",
        Component: MembersView,
      },
      {
        path: "/disciplines",
        Component: DisciplinesView,
      },
      {
        path: "/payments",
        Component: PaymentsView,
      },
    ],
  },
]);
