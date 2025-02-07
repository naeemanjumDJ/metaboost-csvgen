import { auth } from "@/auth";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";

const Page = async () => {
  const session = await auth();
  return (
    <>
      <Navbar />
      <Hero isAuthenticated={!!session} />
    </>
  );
};

export default Page;
