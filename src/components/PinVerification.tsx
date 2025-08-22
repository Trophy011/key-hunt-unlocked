import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PinVerificationProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
  title?: string;
  description?: string;
}

const PinVerification = ({ 
  isOpen, 
  onClose, 
  onVerified, 
  title = "Transaction PIN Required",
  description = "Please enter your 4-digit PIN to continue with this transaction."
}: PinVerificationProps) => {
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length !== 4) {
      setError("PIN must be 4 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // For now, we'll use a simple verification
      // In production, this should hash the PIN and compare with stored hash
      const { data: userPin, error: fetchError } = await supabase
        .from('user_pins')
        .select('pin_hash')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      // If no PIN exists, create one with the entered PIN
      if (!userPin) {
        const { error: insertError } = await supabase
          .from('user_pins')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            pin_hash: pin // In production, this should be hashed
          });

        if (insertError) throw insertError;

        toast({
          title: "PIN Set Successfully",
          description: "Your transaction PIN has been set and verified.",
        });
      } else {
        // Verify PIN (in production, compare hashed values)
        if (userPin.pin_hash !== pin) {
          throw new Error("Invalid PIN. Please try again.");
        }
      }

      onVerified();
      onClose();
      setPin("");
    } catch (error: any) {
      setError(error.message || "PIN verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPin("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter 4-digit PIN"
              value={pin}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                setPin(value);
                setError("");
              }}
              className="text-center text-2xl tracking-widest"
              maxLength={4}
              autoFocus
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={pin.length !== 4 || loading}
              className="flex-1"
            >
              {loading ? "Verifying..." : "Verify PIN"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PinVerification;