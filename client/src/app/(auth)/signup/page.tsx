
import { AuthProvider } from "@/components/AuthProvider";
import Signup from "@/components/Signup";
import Image from "next/image";

export default function SignInPage() {
  return <div className="relative">
     <Image
          src="/landing-splash.jpg"
          alt="Landing Splash"
          fill
          className='object-cover object-center'
          priority
          />
  <AuthProvider>
  <Signup/>
  </AuthProvider>
  </div>
}