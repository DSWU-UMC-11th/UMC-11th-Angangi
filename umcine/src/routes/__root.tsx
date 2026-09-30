import { createRootRoute, Outlet } from "@tanstack/react-router";
import Footer from "../components/footer";
import Header from "../components/header";
import "../layout.css";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}
