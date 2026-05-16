import { createBrowserRouter } from "react-router";
import { MembersView } from "./views/Members";
import { SportsView } from "./views/Sports";
import { HomeView } from "./views/Home";
import { PaymentsView } from "./views/Payments";
import { MedicalCertificatesView } from "./views/MedicalCertificates";

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
        path: "/sports",
        Component: SportsView,
      },
      {
        path: "/payments",
        Component: PaymentsView,
      },
      {
        path: "/medical-certificates",
        Component: MedicalCertificatesView,
      },

    ],
  },
]);