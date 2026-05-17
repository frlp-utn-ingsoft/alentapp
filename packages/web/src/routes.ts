import { createBrowserRouter } from "react-router";

import { MembersView } from "./views/Members";
import { DisciplinesView } from "./views/Disciplines";
import { LoansView } from "./views/Loans";
import { MedicalCertificatesView } from "./views/MedicalCertificates";
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
        path: "/disciplines",
        Component: DisciplinesView,
      },
      {
        path: "/loans",
        Component: LoansView,
      },
      {
        path: "/medical-certificates",
        Component: MedicalCertificatesView,
      },
    ],
  },
]);
