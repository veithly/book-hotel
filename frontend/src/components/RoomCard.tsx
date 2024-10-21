import { useReadContract, useAccount, useWriteContract } from "wagmi";
import {
  bookingAbi,
  bookingAddress,
  tokenAbi,
  tokenAddress,
} from "@/constants";
import { toast } from "sonner";
import AddReviewModal from "./AddReviewModal";
import { useEffect, useState } from "react";
import { parseEther } from "viem";

interface RoomCardProps {
  room: any;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  const { address } = useAccount();
  const [isApproved, setIsApproved] = useState(false);

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: tokenAddress,
    abi: tokenAbi,
    functionName: "allowance",
    args: [address, bookingAddress],
  });

  const {
    data: approveHash,
    isPending: isApprovePending,
    writeContractAsync: approveAsync,
  } = useWriteContract();

  const {
    data: bookHash,
    isPending: isBookPending,
    writeContractAsync: bookAsync,
  } = useWriteContract();

  useEffect(() => {
    if (allowance && room.pricePerNight) {
      setIsApproved((allowance as bigint) >= parseEther(room.pricePerNight.toString()));
    }
  }, [allowance, room.pricePerNight]);

  const handleApprove = async () => {
    try {
      const approveTx = await approveAsync({
        address: tokenAddress,
        abi: tokenAbi,
        functionName: "approve",
        args: [bookingAddress, parseEther(room.pricePerNight.toString())],
      });
      console.log("Approve transaction hash:", approveTx);
      await refetchAllowance();
    } catch (err: any) {
      toast.error("Approval Failed: " + err.message);
    }
  };

  const handleBookRoom = async () => {
    if (!isApproved) {
      toast.error("Please approve the token spending first.");
      return;
    }

    try {
      const bookRoomTx = await bookAsync({
        address: bookingAddress,
        abi: bookingAbi,
        functionName: "bookRoomByCategory",
        args: [room.category, 224, 2244],
      });

      console.log("Room booking hash:", bookRoomTx);
    } catch (err: any) {
      toast.error("Booking Failed: " + err.message);
    }
  };

  const getImageByCategory = (category: string) => {
    switch (category) {
      case "Presidential":
        return "/2071.jpg";
      case "Deluxe":
        return "/2149.jpg";
      case "Suite":
        return "/7715.jpg";
      default:
        return "/7715.jpg";
    }
  };

  const getCategoryLabel = (category: number) => {
    switch (category) {
      case 0:
        return "Presidential";
      case 1:
        return "Deluxe";
      case 2:
        return "Suite";
      default:
        return "";
    }
  };

  return (
    <div className="border p-4 m-4">
      <img
        src={getImageByCategory(getCategoryLabel(room.category))}
        alt="Room"
        className="w-full h-56 object-cover mb-4"
      />

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold">
            {getCategoryLabel(room.category)}
          </h3>
          <p className="text-md">
            Price per Night: {room.pricePerNight?.toString()}
          </p>
          <p className="text-sm">
            Availability: {room.isAvailable ? "Available" : "Unavailable"}
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold mt-2">Reviews:</h4>
          {room.reviews?.length > 0 ? (
            room.reviews.map((review: any, index: any) => (
              <div className="text-sm" key={index}>
                <p className="">
                  {review.comment} - {review.rating} stars
                </p>
              </div>
            ))
          ) : (
            <p>No reviews yet.</p>
          )}

          <div className="flex gap-3">
            {room.isAvailable && (
              <>
                {!isApproved && (
                  <button
                    onClick={handleApprove}
                    disabled={isApprovePending}
                    className="bg-blue-600 text-white p-2 mt-2"
                  >
                    {isApprovePending ? "Approving..." : "Approve"}
                  </button>
                )}
                <button
                  onClick={handleBookRoom}
                  disabled={isBookPending || !isApproved}
                  className="bg-green-600 text-white p-2 mt-2"
                >
                  {isBookPending ? "Booking..." : "Book Room"}
                </button>
              </>
            )}

            <AddReviewModal>
              <button className="bg-gray-600 text-white p-2 mt-2">
                Add Review
              </button>
            </AddReviewModal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
