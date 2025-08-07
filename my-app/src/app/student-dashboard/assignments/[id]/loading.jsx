import { Spinner } from "@heroui/react";
import Image from "next/image";
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#1e2b22] via-[#1e1f2b] to-[#2b1e2e]">
      <Image src="/2.png" alt="Placeholder" width={100} height={100} />
      <p>Loading your assignment...</p>
    </div>
  );
}
