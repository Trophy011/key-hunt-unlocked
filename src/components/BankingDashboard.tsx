import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownLeft, Plus, Send, History, Settings, LogOut, DollarSign, Euro, PoundSterling, CreditCard, Receipt, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import InternationalTransfer from "./InternationalTransfer";
import TransactionHistory from "./TransactionHistory";
import ATMCard from "./ATMCard";
import BillPayment from "./BillPayment";
import InternalTransfer from "./InternalTransfer";
import { useToast } from "@/hooks/use-toast";

interface Account {
  id: string;
  account_number: string;
  currency: string;
  balance: number;
  account_type: string;
}

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  transaction_type: string;
  status: string;
  created_at: string;
  from_account?: { currency: string; account_number: string };
  to_account?: { currency: string; account_number: string };
}

const BankingDashboard = () => {
  const { user, signOut } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchAccountsAndTransactions();
    }
  }, [user]);

  const fetchAccountsAndTransactions = async () => {
    try {
      // Fetch user accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user?.id)
        .order('currency');

      if (accountsError) throw accountsError;

      // Fetch transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          from_account:accounts!transactions_from_account_id_fkey(currency, account_number),
          to_account:accounts!transactions_to_account_id_fkey(currency, account_number)
        `)
        .or(`from_account_id.in.(${accountsData?.map(a => a.id).join(',')}),to_account_id.in.(${accountsData?.map(a => a.id).join(',')})`)
        .order('created_at', { ascending: false });

      if (transactionsError) throw transactionsError;

      setAccounts(accountsData || []);
      setTransactions(transactionsData || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'USD': return <DollarSign className="h-5 w-5" />;
      case 'EUR': return <Euro className="h-5 w-5" />;
      case 'GBP': return <PoundSterling className="h-5 w-5" />;
      case 'PLN': return <span className="text-sm font-bold">zł</span>;
      default: return <DollarSign className="h-5 w-5" />;
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD': return '$';
      case 'EUR': return '€';
      case 'GBP': return '£';
      case 'PLN': return 'zł';
      default: return '$';
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const totalBalance = accounts.reduce((sum, account) => {
    // Convert all to USD for total (simplified conversion)
    const rate = account.currency === 'EUR' ? 1.1 : account.currency === 'GBP' ? 1.25 : account.currency === 'PLN' ? 0.25 : 1;
    return sum + (account.balance * rate);
  }, 0);

  const handleLogout = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your accounts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-600 p-2 rounded-lg">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">US Bank</h1>
                <p className="text-sm text-gray-500">Welcome, {user?.user_metadata?.first_name || user?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="transition-all duration-200 hover:scale-105">Overview</TabsTrigger>
            <TabsTrigger value="transfer" className="transition-all duration-200 hover:scale-105">Transfer</TabsTrigger>
            <TabsTrigger value="internal" className="transition-all duration-200 hover:scale-105">
              <Users className="h-4 w-4 mr-1" />
              Internal
            </TabsTrigger>
            <TabsTrigger value="bills" className="transition-all duration-200 hover:scale-105">
              <Receipt className="h-4 w-4 mr-1" />
              Bills
            </TabsTrigger>
            <TabsTrigger value="cards" className="transition-all duration-200 hover:scale-105">
              <CreditCard className="h-4 w-4 mr-1" />
              Cards
            </TabsTrigger>
            <TabsTrigger value="history" className="transition-all duration-200 hover:scale-105">History</TabsTrigger>
            <TabsTrigger value="settings" className="transition-all duration-200 hover:scale-105">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Total Balance */}
            <Card>
              <CardHeader>
                <CardTitle>Total Balance (USD Equivalent)</CardTitle>
                <CardDescription>Combined value of all your accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {formatAmount(totalBalance, 'USD')}
                </div>
              </CardContent>
            </Card>

            {/* Accounts Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {accounts.map((account) => (
                <Card key={account.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 animate-fade-in bg-card-gradient">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center space-x-2">
                      {getCurrencyIcon(account.currency)}
                      <CardTitle className="text-sm font-medium">
                        {account.currency} Account
                      </CardTitle>
                    </div>
                    <Badge variant="secondary">{account.account_type}</Badge>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-2">
                      {formatAmount(account.balance, account.currency)}
                    </div>
                    <CardDescription className="mb-4">
                      Account {account.account_number}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest account activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-all duration-200 hover:scale-[1.02] animate-fade-in">
                      <div className="flex items-center space-x-3">
                        {transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer' ? (
                          <ArrowDownLeft className="h-5 w-5 text-success" />
                        ) : (
                          <ArrowUpRight className="h-5 w-5 text-destructive" />
                        )}
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.transaction_type === 'deposit' ? 'text-success' : 'text-destructive'
                        }`}>
                          {transaction.transaction_type === 'deposit' ? '+' : '-'}
                          {formatAmount(transaction.amount, transaction.currency)}
                        </p>
                        <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transfer" className="animate-fade-in">
            <InternationalTransfer accounts={accounts} onTransferComplete={fetchAccountsAndTransactions} />
          </TabsContent>

          <TabsContent value="internal" className="animate-fade-in">
            <InternalTransfer accounts={accounts} onTransferComplete={fetchAccountsAndTransactions} />
          </TabsContent>

          <TabsContent value="bills" className="animate-fade-in">
            <BillPayment accounts={accounts} />
          </TabsContent>

          <TabsContent value="cards" className="animate-fade-in">
            <ATMCard accounts={accounts} />
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <TransactionHistory transactions={transactions} />
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your US Bank account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium mb-2">Profile Information</h3>
                      <p className="text-sm text-muted-foreground">Email: {user?.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Name: {user?.user_metadata?.first_name} {user?.user_metadata?.last_name}
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium mb-2">Security</h3>
                      <p className="text-sm text-muted-foreground">Two-factor authentication: Enabled</p>
                      <p className="text-sm text-muted-foreground">Last login: {new Date().toLocaleDateString()}</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium mb-2">Notifications</h3>
                      <p className="text-sm text-muted-foreground">Email notifications: Enabled</p>
                      <p className="text-sm text-muted-foreground">SMS alerts: Enabled</p>
                    </div>
                    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <h3 className="font-medium mb-2">Account Limits</h3>
                      <p className="text-sm text-muted-foreground">Daily transfer limit: $10,000</p>
                      <p className="text-sm text-muted-foreground">Monthly transfer limit: $50,000</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BankingDashboard;