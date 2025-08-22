import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserCheck, Send, Users, ArrowRight, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PinVerification from "./PinVerification";

interface Account {
  id: string;
  account_number: string;
  currency: string;
  balance: number;
  account_type: string;
}

interface InternalTransferProps {
  accounts: Account[];
  onTransferComplete: () => void;
}

const InternalTransfer = ({ accounts, onTransferComplete }: InternalTransferProps) => {
  const [fromAccount, setFromAccount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const { toast } = useToast();

  // Mock frequent contacts
  const frequentContacts = [
    { name: 'John Smith', email: 'john.smith@email.com', initials: 'JS', lastTransfer: '$250.00' },
    { name: 'Sarah Wilson', email: 'sarah.w@email.com', initials: 'SW', lastTransfer: '$100.00' },
    { name: 'Mike Johnson', email: 'mike.j@email.com', initials: 'MJ', lastTransfer: '$75.50' },
    { name: 'Emily Davis', email: 'emily.davis@email.com', initials: 'ED', lastTransfer: '$300.00' },
  ];

  const handleTransfer = async () => {
    if (!fromAccount || !recipientEmail || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, check if recipient exists and get their account
      const { data: recipientProfile, error: recipientError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', recipientEmail)
        .single();

      if (recipientError || !recipientProfile) {
        toast({
          title: "Recipient Not Found",
          description: "The recipient email is not registered with US Bank.",
          variant: "destructive",
        });
        return;
      }

      // Get recipient's account in the same currency
      const selectedAccount = accounts.find(acc => acc.id === fromAccount);
      const { data: recipientAccount, error: recipientAccountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', recipientProfile.user_id)
        .eq('currency', selectedAccount?.currency)
        .single();

      if (recipientAccountError || !recipientAccount) {
        toast({
          title: "Transfer Failed",
          description: `Recipient doesn't have a ${selectedAccount?.currency} account.`,
          variant: "destructive",
        });
        return;
      }

      // Check sufficient balance
      if (selectedAccount && selectedAccount.balance < parseFloat(amount)) {
        toast({
          title: "Insufficient Funds",
          description: "You don't have enough balance for this transfer.",
          variant: "destructive",
        });
        return;
      }

      // Create transfer transaction
      const { error: transferError } = await supabase
        .from('transactions')
        .insert([
          {
            from_account_id: fromAccount,
            to_account_id: recipientAccount.id,
            amount: parseFloat(amount),
            currency: selectedAccount?.currency,
            transaction_type: 'transfer',
            description: description || `Internal transfer to ${recipientEmail}`,
            reference_number: `INT-${Date.now()}`,
            status: 'completed'
          }
        ]);

      if (transferError) throw transferError;

      // Update account balances
      await supabase
        .from('accounts')
        .update({ balance: selectedAccount!.balance - parseFloat(amount) })
        .eq('id', fromAccount);

      await supabase
        .from('accounts')
        .update({ balance: recipientAccount.balance + parseFloat(amount) })
        .eq('id', recipientAccount.id);

      toast({
        title: "Transfer Successful",
        description: `$${amount} sent to ${recipientEmail}`,
      });

      // Reset form
      setFromAccount('');
      setRecipientEmail('');
      setAmount('');
      setDescription('');
      onTransferComplete();

    } catch (error: any) {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickTransfer = (contact: typeof frequentContacts[0]) => {
    setRecipientEmail(contact.email);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Frequent Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Frequent Contacts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {frequentContacts.map((contact, index) => (
              <Card 
                key={index} 
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                onClick={() => handleQuickTransfer(contact)}
              >
                <CardContent className="p-4 text-center">
                  <Avatar className="h-12 w-12 mx-auto mb-2">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {contact.initials}
                    </AvatarFallback>
                  </Avatar>
                  <h4 className="font-medium mb-1">{contact.name}</h4>
                  <p className="text-xs text-muted-foreground mb-2">{contact.email}</p>
                  <Badge variant="outline" className="text-xs">
                    Last: {contact.lastTransfer}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Transfer Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Send Money to US Bank Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="from-account">From Account</Label>
              <Select value={fromAccount} onValueChange={setFromAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account to send from" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <div className="flex justify-between items-center w-full">
                        <span>{account.currency} Account</span>
                        <span className="text-muted-foreground ml-2">
                          Balance: {account.balance.toFixed(2)} {account.currency}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient's email address"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this transfer for?"
              />
            </div>
          </div>

          {/* Transfer Summary */}
          {fromAccount && amount && recipientEmail && (
            <div className="p-4 bg-muted rounded-lg animate-scale-in">
              <h4 className="font-medium mb-2">Transfer Summary</h4>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span>From: {accounts.find(acc => acc.id === fromAccount)?.currency} Account</span>
                  <ArrowRight className="h-4 w-4" />
                  <span>To: {recipientEmail}</span>
                </div>
                <div className="font-bold">
                  ${amount} {accounts.find(acc => acc.id === fromAccount)?.currency}
                </div>
              </div>
            </div>
          )}

          <Button 
            onClick={() => setShowPinDialog(true)} 
            disabled={isLoading || !fromAccount || !amount || !recipientEmail}
            className="w-full"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Transfer...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Money
              </>
            )}
          </Button>

          <PinVerification
            isOpen={showPinDialog}
            onClose={() => setShowPinDialog(false)}
            onVerified={handleTransfer}
            title="Authorize Internal Transfer"
            description="Please enter your PIN to authorize this transfer."
          />

          {/* Security Notice */}
          <div className="p-3 bg-info/10 border border-info/20 rounded-lg">
            <div className="flex items-start gap-2">
              <UserCheck className="h-4 w-4 text-info mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-info">Secure Internal Transfer</p>
                <p className="text-muted-foreground">
                  Transfers to other US Bank customers are instant and secure. 
                  Recipient will be notified immediately.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InternalTransfer;