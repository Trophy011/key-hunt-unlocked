import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, CreditCard, Lock, Unlock, Settings } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  account_number: string;
  currency: string;
  balance: number;
  account_type: string;
}

interface ATMCardProps {
  accounts: Account[];
}

const ATMCard = ({ accounts }: ATMCardProps) => {
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [cardStatus, setCardStatus] = useState<'active' | 'blocked'>('active');
  const { toast } = useToast();

  const primaryAccount = accounts.find(acc => acc.currency === 'USD') || accounts[0];
  
  // Mock card details
  const cardNumber = "4532 1234 5678 9012";
  const expiryDate = "12/27";
  const cvv = "123";
  const cardholderName = "ACCOUNT HOLDER";

  const handleToggleCard = () => {
    const newStatus = cardStatus === 'active' ? 'blocked' : 'active';
    setCardStatus(newStatus);
    
    toast({
      title: newStatus === 'active' ? "Card Activated" : "Card Blocked",
      description: `Your ATM card has been ${newStatus === 'active' ? 'activated' : 'temporarily blocked'}.`,
      variant: newStatus === 'active' ? 'default' : 'destructive',
    });
  };

  const handleRequestNewCard = () => {
    toast({
      title: "New Card Requested",
      description: "Your new ATM card will arrive in 5-7 business days.",
    });
  };

  const formatCardNumber = (number: string, show: boolean) => {
    if (show) {
      return number;
    }
    return number.replace(/\d(?=\d{4})/g, "*");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            ATM Card Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Virtual Card Display */}
          <div className="relative">
            <div className="bg-banking-gradient p-6 rounded-xl text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="text-sm opacity-80">US Bank</div>
                  <div className="text-xs opacity-60">Debit Card</div>
                </div>
                <Badge 
                  variant={cardStatus === 'active' ? 'default' : 'destructive'}
                  className="bg-white/20 text-white"
                >
                  {cardStatus.toUpperCase()}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div className="font-mono text-lg tracking-wider">
                  {formatCardNumber(cardNumber, showCardNumber)}
                </div>
                
                <div className="flex justify-between items-end">
                  <div>
                    <div className="text-xs opacity-60">VALID THRU</div>
                    <div className="font-mono">{expiryDate}</div>
                  </div>
                  <div>
                    <div className="text-xs opacity-60">CVV</div>
                    <div className="font-mono">
                      {showCardNumber ? cvv : "***"}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="text-xs opacity-60">CARDHOLDER</div>
                  <div className="font-semibold">{cardholderName}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Card Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => setShowCardNumber(!showCardNumber)}
              className="justify-start"
            >
              {showCardNumber ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showCardNumber ? 'Hide' : 'Show'} Card Details
            </Button>

            <Button
              variant={cardStatus === 'active' ? 'destructive' : 'default'}
              onClick={handleToggleCard}
              className="justify-start"
            >
              {cardStatus === 'active' ? <Lock className="h-4 w-4 mr-2" /> : <Unlock className="h-4 w-4 mr-2" />}
              {cardStatus === 'active' ? 'Block' : 'Unblock'} Card
            </Button>

            <Button variant="outline" onClick={handleRequestNewCard} className="justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Request New Card
            </Button>

            <Button variant="outline" className="justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Card Settings
            </Button>
          </div>

          {/* Linked Account Info */}
          {primaryAccount && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Linked Account</h4>
              <div className="text-sm text-muted-foreground">
                <p>Account: {primaryAccount.account_number}</p>
                <p>Type: {primaryAccount.account_type}</p>
                <p>Currency: {primaryAccount.currency}</p>
              </div>
            </div>
          )}

          {/* Card Limits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">$1,000</div>
              <div className="text-sm text-muted-foreground">Daily ATM Limit</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">$5,000</div>
              <div className="text-sm text-muted-foreground">Daily Purchase Limit</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-primary">$50,000</div>
              <div className="text-sm text-muted-foreground">Monthly Limit</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ATMCard;