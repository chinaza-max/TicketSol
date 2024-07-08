import Image from "next/image";
import SignupForm from "./components/form"
import Navbar from "./components/navbar"


export default function Home() {
  return (
    <main>
            <Navbar/>
            <SignupForm/>
    </main>
  );
}
