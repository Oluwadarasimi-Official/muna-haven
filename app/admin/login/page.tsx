import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = {
  title: "Owner sign in — Muna's Haven",
};

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
