import { createBrowserRouter } from "react-router";

import { MembersView } from "./views/Members";
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
        path: "/medical-certificates",
        Component: MedicalCertificatesView,
      },
    ],
  },
]);
