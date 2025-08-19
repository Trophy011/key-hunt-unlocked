import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  account_number: string;
  currency: string;
  balance: number;
  account_type: string;
}

interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
}

interface Bank {
  id: string;
  name: string;
  swift_code: string;
  country_id: string;
}

interface InternationalTransferProps {
  accounts: Account[];
  onTransferComplete: () => void;
}

const InternationalTransfer = ({ accounts, onTransferComplete }: InternationalTransferProps) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [transferData, setTransferData] = useState({
    fromAccountId: "",
    toCountryId: "",
    toBankId: "",
    toAccountNumber: "",
    recipientName: "",
    amount: "",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCountriesAndBanks();
  }, []);

  useEffect(() => {
    if (transferData.toCountryId) {
      const filtered = banks.filter(bank => bank.country_id === transferData.toCountryId);
      setFilteredBanks(filtered);
    } else {
      setFilteredBanks([]);
    }
  }, [transferData.toCountryId, banks]);

  const fetchCountriesAndBanks = async () => {
    try {
      const [countriesResponse, banksResponse] = await Promise.all([
        supabase.from('countries').select('*').order('name'),
        supabase.from('banks').select('*').order('name')
      ]);

      if (countriesResponse.error) throw countriesResponse.error;
      if (banksResponse.error) throw banksResponse.error;

      setCountries(countriesResponse.data || []);
      setBanks(banksResponse.data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleTransfer = async () => {
    if (!transferData.fromAccountId || !transferData.toBankId || !transferData.toAccountNumber || 
        !transferData.recipientName || !transferData.amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(transferData.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Transfer amount must be greater than 0.",
        variant: "destructive",
      });
      return;
    }

    const fromAccount = accounts.find(acc => acc.id === transferData.fromAccountId);
    if (!fromAccount) {
      toast({
        title: "Account Error",
        description: "Invalid source account selected.",
        variant: "destructive",
      });
      return;
    }

    if (fromAccount.balance < amount) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough funds for this transfer.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate reference number
      const referenceNumber = `INT${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Create transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          from_account_id: transferData.fromAccountId,
          amount: amount,
          currency: fromAccount.currency,
          transaction_type: 'international_transfer',
          description: transferData.description || `International transfer to ${transferData.recipientName}`,
          reference_number: referenceNumber,
          to_bank_id: transferData.toBankId,
          to_account_number: transferData.toAccountNumber,
          recipient_name: transferData.recipientName,
          status: 'completed'
        });

      if (transactionError) throw transactionError;

      // Update account balance
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: fromAccount.balance - amount })
        .eq('id', transferData.fromAccountId);

      if (updateError) throw updateError;

      setTransferComplete(true);
      onTransferComplete();

      toast({
        title: "Transfer Successful",
        description: `International transfer of ${amount} ${fromAccount.currency} completed successfully.`,
      });

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

  const resetForm = () => {
    setTransferData({
      fromAccountId: "",
      toCountryId: "",
      toBankId: "",
      toAccountNumber: "",
      recipientName: "",
      amount: "",
      description: "",
    });
    setTransferComplete(false);
  };

  const selectedBank = banks.find(bank => bank.id === transferData.toBankId);
  const selectedCountry = countries.find(country => country.id === transferData.toCountryId);
  const selectedAccount = accounts.find(acc => acc.id === transferData.fromAccountId);

  if (transferComplete) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h3 className="text-2xl font-bold text-green-600">Transfer Successful!</h3>
            <p className="text-gray-600">
              Your international transfer has been processed successfully.
            </p>
            <Button onClick={resetForm} className="mt-4">
              Make Another Transfer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>International Transfer</CardTitle>
        <CardDescription>
          Send money to bank accounts worldwide with competitive exchange rates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* From Account */}
          <div className="space-y-2">
            <Label htmlFor="fromAccount">From Account</Label>
            <Select value={transferData.fromAccountId} onValueChange={(value) => 
              setTransferData(prev => ({ ...prev, fromAccountId: value }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select source account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.currency} Account - Balance: {account.balance.toLocaleString()} {account.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipient Name */}
          <div className="space-y-2">
            <Label htmlFor="recipientName">Recipient Name</Label>
            <Input
              id="recipientName"
              value={transferData.recipientName}
              onChange={(e) => setTransferData(prev => ({ ...prev, recipientName: e.target.value }))}
              placeholder="Enter recipient's full name"
            />
          </div>

          {/* Country Selection */}
          <div className="space-y-2">
            <Label htmlFor="country">Destination Country</Label>
            <Select value={transferData.toCountryId} onValueChange={(value) => 
              setTransferData(prev => ({ ...prev, toCountryId: value, toBankId: "" }))
            }>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name} ({country.currency})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bank Selection */}
          <div className="space-y-2">
            <Label htmlFor="bank">Destination Bank</Label>
            <Select 
              value={transferData.toBankId} 
              onValueChange={(value) => setTransferData(prev => ({ ...prev, toBankId: value }))}
              disabled={!transferData.toCountryId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select bank" />
              </SelectTrigger>
              <SelectContent>
                {filteredBanks.map((bank) => (
                  <SelectItem key={bank.id} value={bank.id}>
                    {bank.name} ({bank.swift_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Account Number */}
          <div className="space-y-2">
            <Label htmlFor="toAccountNumber">Recipient Account Number</Label>
            <Input
              id="toAccountNumber"
              value={transferData.toAccountNumber}
              onChange={(e) => setTransferData(prev => ({ ...prev, toAccountNumber: e.target.value }))}
              placeholder="Enter recipient's account number"
            />
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={transferData.amount}
              onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            {selectedAccount && (
              <p className="text-sm text-gray-500">
                Available: {selectedAccount.balance.toLocaleString()} {selectedAccount.currency}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={transferData.description}
            onChange={(e) => setTransferData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Enter transfer purpose or description"
            rows={3}
          />
        </div>

        {/* Transfer Summary */}
        {transferData.fromAccountId && transferData.amount && transferData.toBankId && (
          <Alert>
            <ArrowRight className="h-4 w-4" />
            <AlertDescription>
              <strong>Transfer Summary:</strong><br />
              From: {selectedAccount?.currency} Account ({selectedAccount?.account_number})<br />
              To: {transferData.recipientName} at {selectedBank?.name} ({selectedCountry?.name})<br />
              Amount: {transferData.amount} {selectedAccount?.currency}<br />
              Account: {transferData.toAccountNumber}
            </AlertDescription>
          </Alert>
        )}

        <Button 
          onClick={handleTransfer} 
          disabled={isLoading} 
          className="w-full"
          size="lg"
        >
          {isLoading ? "Processing Transfer..." : "Send International Transfer"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default InternationalTransfer;