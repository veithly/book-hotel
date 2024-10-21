"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  bookingAbi,
  bookingAddress,
} from "@/constants";

import { useReadContract, useAccount } from "wagmi";
import RoomCard from "@/components/RoomCard";
import AddRoomModal from "@/components/AddRoomModal";
import SetAvailabilityModal from "@/components/SetAvailabilityModal";

export default function Home() {
  const [rooms, setRooms] = useState<any>([]);
  const [isOwner, setIsOwner] = useState(false);

  const { address } = useAccount();

  const {
    data: roomData,
  } = useReadContract({
    abi: bookingAbi,
    address: bookingAddress,
    functionName: "getAllRooms",
  });

  const {
    data: ownerAddress,
  } = useReadContract({
    abi: bookingAbi,
    address: bookingAddress,
    functionName: "owner",
  });

  useEffect(() => {
    if (roomData) {
      setRooms(roomData);
    }
  }, [roomData]);

  useEffect(() => {
    if (address && typeof ownerAddress === 'string') {
      setIsOwner(address.toLowerCase() === ownerAddress.toLowerCase());
    }
  }, [address, ownerAddress]);

  return (
    <main>
      {isOwner && (
        <section className="py-12 flex items-center justify-between ">
          <h1 className="text-lg font-bold">Owner actions</h1>
          <div className="flex items-center gap-2">
            <AddRoomModal>
              <Button>Add room</Button>
            </AddRoomModal>
            <SetAvailabilityModal>
              <Button>Set availability</Button>
            </SetAvailabilityModal>
          </div>
        </section>
      )}

      <div>
        {rooms.length > 0 ? (
          rooms?.map((room: any) => (
            <RoomCard key={room.id} room={room} />
          ))
        ) : (
          <div>
            <h1 className="text-2xl font-semibold">No rooms available</h1>
          </div>
        )}
      </div>
    </main>
  );
}
