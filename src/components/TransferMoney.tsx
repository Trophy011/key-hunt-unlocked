
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRightLeft, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  accountNumber: string;
  icon: any;
}

interface TransferMoneyProps {
  accounts: Account[];
}

const TransferMoney = ({ accounts }: TransferMoneyProps) => {
  const [transferData, setTransferData] = useState({
    fromAccount: "",
    toAccount: "",
    amount: "",
    description: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [transferComplete, setTransferComplete] = useState(false);
  const { toast } = useToast();

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferData.fromAccount || !transferData.toAccount || !transferData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (transferData.fromAccount === transferData.toAccount) {
      toast({
        title: "Error", 
        description: "Cannot transfer to the same account",
        variant: "destructive"
      });
      return;
    }

    const amount = parseFloat(transferData.amount);
    if (amount <= 0) {
      toast({
        title: "Error",
        description: "Amount must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    const fromAccount = accounts.find(acc => acc.id === transferData.fromAccount);
    if (fromAccount && amount > fromAccount.balance) {
      toast({
        title: "Error",
        description: "Insufficient funds",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setTransferComplete(true);
      toast({
        title: "Transfer Successful",
        description: `$${amount.toFixed(2)} transferred successfully`
      });
    }, 2000);
  };

  const resetForm = () => {
    setTransferData({
      fromAccount: "",
      toAccount: "",
      amount: "",
      description: ""
    });
    setTransferComplete(false);
  };

  if (transferComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Transfer Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your transfer of ${parseFloat(transferData.amount).toFixed(2)} has been completed.
          </p>
          <Button onClick={resetForm}>
            Make Another Transfer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowRightLeft className="h-5 w-5 mr-2" />
            Transfer Money
          </CardTitle>
          <CardDescription>
            Transfer funds between your accounts or to external accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleTransfer} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromAccount">From Account</Label>
                <Select 
                  value={transferData.fromAccount} 
                  onValueChange={(value) => setTransferData(prev => ({ ...prev, fromAccount: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{account.name}</span>
                          <span className="text-sm text-gray-500 ml-4">
                            ${account.balance.toFixed(2)}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="toAccount">To Account</Label>
                <Select 
                  value={transferData.toAccount} 
                  onValueChange={(value) => setTransferData(prev => ({ ...prev, toAccount: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{account.name}</span>
                          <span className="text-sm text-gray-500 ml-4">
                            {account.accountNumber}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={transferData.amount}
                onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                className="text-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                placeholder="What is this transfer for?"
                value={transferData.description}
                onChange={(e) => setTransferData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            {transferData.fromAccount && transferData.toAccount && transferData.amount && (
              <Alert>
                <AlertDescription>
                  You are about to transfer ${parseFloat(transferData.amount || "0").toFixed(2)} from{" "}
                  {accounts.find(acc => acc.id === transferData.fromAccount)?.name} to{" "}
                  {accounts.find(acc => acc.id === transferData.toAccount)?.name}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing Transfer..." : "Transfer Money"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferMoney;
