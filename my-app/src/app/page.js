"use client";

import Image from "next/image";
import styles from "./page.module.css";
import { Button } from "@heroui/react";
import { createClient } from "../../utils/supabase/client";
import { useEffect, useState } from "react";
import Navigation from "./components/nav";
import LandingPage from "./landing/landing";
import { Landing } from "./landing-new/landing";
export default function Home() {
  const supabase = createClient();

  const [session, setSession] = useState(null);
  const fetchSession = async () => {
    const currentSession = await supabase.auth.getSession();
    console.log(currentSession);
    setSession(currentSession.data.session);
  };

  useEffect(() => {
    fetchSession();
    if (!session) {
    }
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event, session);
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe(); // need to unsubscribe to avoid memory leaks
    };
  }, []);

  return (
    <>
      {/* Need to edit this component
      <Navigation session={session}></Navigation> 


    <div className="flex flex-col items-center justify-center h-[96vh] bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e] text-foreground">
      {session && (
             <h1>You are Logged In !</h1>
) }
      
      
    </div> */}

      {/* <LandingPage></LandingPage> */}
      <Landing />
    </>
  );
}
