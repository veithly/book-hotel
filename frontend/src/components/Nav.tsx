"use client";
import Image from "next/image";
import { ModeToggle } from "./Modetoggle";
import { useAccount, useDisconnect } from "wagmi";
import { Button } from "./ui/button";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { truncateAddress } from "@/lib/utils";

export default function Nav() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useWeb3Modal();

  const handleConnect = () => {
    open();
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <header>
      <nav>
        <ul className="flex items-center justify-between">
          <li>
            <a
              className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
              href="https://vercel.com?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                src="/pex.png"
                alt="PEX Logo"
                className="dark:invert"
                width={100}
                height={24}
                priority
              />
            </a>
          </li>

          <li>
            <h1 className="text-2xl font-bold">Hotel Booking Dapp</h1>
          </li>
          <li>
            <div className="flex items-center gap-3">
              {!isConnected ? (
                <Button onClick={handleConnect}>Connect Wallet</Button>
              ) : (
                <div className="flex items-center gap-2">
                  <p>{truncateAddress(address)}</p>
                  <Button variant="destructive" onClick={handleDisconnect}>
                    Disconnect
                  </Button>
                </div>
              )}
              <ModeToggle />
            </div>
          </li>
        </ul>
      </nav>
    </header>
  );
}
