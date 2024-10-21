import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useEffect, useState } from "react";
import { bookingAbi, bookingAddress } from "@/constants";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface SetAvailabilityModalProps {
  children: React.ReactNode;
}

const SetAvailabilityModal = ({ children }: SetAvailabilityModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: hash,
    error,
    isPending,
    writeContractAsync,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
    });

  useEffect(() => {
    if (isConfirming) {
      toast.loading("Transaction Pending");
    }
    if (isConfirmed) {
      toast.success("Transaction Successful", {
        action: {
          label: "View on Etherscan",
          onClick: () => {
            window.open(`https://explorer-testnet.morphl2.io/tx/${hash}`);
          },
        },
      });
      setIsOpen(false); // 关闭弹窗
    }
    if (error) {
      toast.error("Transaction Failed");
    }
  }, [isConfirming, isConfirmed, error, hash]);

  const formSchema = z.object({
    roomId: z.number().min(0, "Room ID must be a positive number"),
    isAvailable: z.boolean(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomId: 0,
      isAvailable: true,
    },
  });

  const setAvailability = async (data: z.infer<typeof formSchema>) => {
    try {
      const setAvailabilityTx = await writeContractAsync({
        abi: bookingAbi,
        address: bookingAddress,
        functionName: "setRoomAvailability",
        args: [data.roomId, data.isAvailable],
      });

      console.log("Set availability transaction hash:", setAvailabilityTx);
    } catch (err: any) {
      toast.error("Transaction Failed: " + err.message);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild onClick={() => setIsOpen(true)}>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            <div className="flex items-center gap-6 justify-center">
              <AlertDialogCancel className="border-none">
                <MoveLeft size={24} />
              </AlertDialogCancel>
              <h1>Set Room Availability</h1>
            </div>
          </AlertDialogTitle>
        </AlertDialogHeader>
        <div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(setAvailability)} className="space-y-8">
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      <h1 className="text-[#32393A]">Room ID</h1>
                    </FormLabel>
                    <FormControl>
                      <Input
                        className="rounded-full"
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAvailable"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Available
                      </FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                className="bg-[#007A86] self-center my-8 rounded-full w-full"
                size="lg"
                disabled={isPending}
                type="submit"
              >
                {isPending ? "Loading" : "Set Availability"}
              </Button>
            </form>
          </Form>
        </div>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SetAvailabilityModal;
