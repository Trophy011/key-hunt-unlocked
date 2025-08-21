import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Receipt, Calendar as CalendarIcon, Zap, Wifi, Car, Home, CreditCard, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  account_number: string;
  currency: string;
  balance: number;
  account_type: string;
}

interface BillPaymentProps {
  accounts: Account[];
}

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const BillPayment = ({ accounts }: BillPaymentProps) => {
  const [selectedBillType, setSelectedBillType] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { toast } = useToast();

  const billTypes = [
    { id: 'electricity', name: 'Electricity', icon: Zap, color: 'text-yellow-600' },
    { id: 'internet', name: 'Internet/Cable', icon: Wifi, color: 'text-blue-600' },
    { id: 'insurance', name: 'Car Insurance', icon: Car, color: 'text-green-600' },
    { id: 'mortgage', name: 'Mortgage/Rent', icon: Home, color: 'text-purple-600' },
    { id: 'credit', name: 'Credit Card', icon: CreditCard, color: 'text-red-600' },
    { id: 'phone', name: 'Phone', icon: Phone, color: 'text-indigo-600' },
  ];

  const quickPayees = [
    { name: 'ConEd Electric', type: 'electricity', amount: '125.50' },
    { name: 'Verizon FiOS', type: 'internet', amount: '89.99' },
    { name: 'State Farm', type: 'insurance', amount: '156.00' },
    { name: 'Chase Credit Card', type: 'credit', amount: '450.00' },
  ];

  const upcomingBills = [
    { id: 1, title: 'Electricity Bill', amount: 125.50, date: new Date(2025, 7, 25), type: 'electricity' },
    { id: 2, title: 'Internet Bill', amount: 89.99, date: new Date(2025, 7, 28), type: 'internet' },
    { id: 3, title: 'Insurance Premium', amount: 156.00, date: new Date(2025, 8, 1), type: 'insurance' },
    { id: 4, title: 'Credit Card Payment', amount: 450.00, date: new Date(2025, 8, 15), type: 'credit' },
  ];

  const handlePayBill = async () => {
    if (!selectedAccount || !amount || !payeeName) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Simulate bill payment
    toast({
      title: "Bill Payment Scheduled",
      description: `Payment of $${amount} to ${payeeName} has been scheduled.`,
    });

    // Reset form
    setAmount('');
    setPayeeName('');
    setAccountNumber('');
    setSelectedBillType('');
    setDueDate('');
  };

  const handleQuickPay = (payee: typeof quickPayees[0]) => {
    setPayeeName(payee.name);
    setAmount(payee.amount);
    setSelectedBillType(payee.type);
  };

  const getBillIcon = (type: string) => {
    const billType = billTypes.find(bt => bt.id === type);
    if (!billType) return Receipt;
    return billType.icon;
  };

  const getBillColor = (type: string) => {
    const billType = billTypes.find(bt => bt.id === type);
    return billType?.color || 'text-gray-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Quick Pay Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Quick Pay Favorites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickPayees.map((payee, index) => {
              const Icon = getBillIcon(payee.type);
              return (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                  onClick={() => handleQuickPay(payee)}
                >
                  <CardContent className="p-4 text-center">
                    <Icon className={`h-8 w-8 mx-auto mb-2 ${getBillColor(payee.type)}`} />
                    <h4 className="font-medium mb-1">{payee.name}</h4>
                    <p className="text-2xl font-bold text-primary">${payee.amount}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Pay New Bill */}
      <Card>
        <CardHeader>
          <CardTitle>Pay New Bill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bill-type">Bill Type</Label>
              <Select value={selectedBillType} onValueChange={setSelectedBillType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bill type" />
                </SelectTrigger>
                <SelectContent>
                  {billTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${type.color}`} />
                          {type.name}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="from-account">Pay From Account</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.currency} Account - {account.account_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payee-name">Payee Name</Label>
              <Input
                id="payee-name"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="Enter payee name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account-number">Account Number</Label>
              <Input
                id="account-number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter account number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date (Optional)</Label>
              <Input
                id="due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <Button onClick={handlePayBill} className="w-full">
            <Receipt className="h-4 w-4 mr-2" />
            Pay Bill
          </Button>
        </CardContent>
      </Card>

      {/* Upcoming Bills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Upcoming Bills
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingBills.map((bill) => {
              const Icon = getBillIcon(bill.type);
              return (
                <div key={bill.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${getBillColor(bill.type)}`} />
                    <div>
                      <p className="font-medium">{bill.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {bill.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${bill.amount.toFixed(2)}</p>
                    <Badge variant="outline" className="text-xs">
                      {Math.ceil((bill.date.getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillPayment;