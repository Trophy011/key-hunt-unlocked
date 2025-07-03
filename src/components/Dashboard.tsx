import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CreditCard, 
  PiggyBank, 
  TrendingUp, 
  Send, 
  History, 
  Settings, 
  LogOut,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  User,
  Lock
} from "lucide-react";
import AccountCard from "@/components/AccountCard";
import TransactionHistory from "@/components/TransactionHistory";
import TransferMoney from "@/components/TransferMoney";

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard = ({ onLogout }: DashboardProps) => {
  const [activeTab, setActiveTab] = useState("overview");

  const accounts = [
    {
      id: "1",
      name: "Checking Account",
      type: "checking",
      balance: 5420.50,
      accountNumber: "****1234",
      icon: CreditCard
    },
    {
      id: "2", 
      name: "Savings Account",
      type: "savings",
      balance: 12850.75,
      accountNumber: "****5678",
      icon: PiggyBank
    },
    {
      id: "3",
      name: "Investment Account", 
      type: "investment",
      balance: 8920.30,
      accountNumber: "****9012",
      icon: TrendingUp
    }
  ];

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  const recentTransactions = [
    { id: "1", description: "Grocery Store", amount: -85.42, date: "2024-01-15", type: "debit" as const },
    { id: "2", description: "Salary Deposit", amount: 3200.00, date: "2024-01-14", type: "credit" as const },
    { id: "3", description: "Electric Bill", amount: -120.50, date: "2024-01-13", type: "debit" as const },
    { id: "4", description: "ATM Withdrawal", amount: -100.00, date: "2024-01-12", type: "debit" as const },
    { id: "5", description: "Interest Earned", amount: 15.25, date: "2024-01-11", type: "credit" as const }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">SecureBank</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome back, John</span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { id: "overview", label: "Overview", icon: CreditCard },
            { id: "transfer", label: "Transfer", icon: Send },
            { id: "history", label: "History", icon: History },
            { id: "settings", label: "Settings", icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content based on active tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Total Balance Card */}
            <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <CardHeader>
                <CardTitle className="text-white">Total Balance</CardTitle>
                <CardDescription className="text-blue-100">
                  Across all accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-4">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +2.5% this month
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Account Cards */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Recent Transactions</h2>
                <Button variant="outline" onClick={() => setActiveTab("history")}>
                  View All
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-200">
                    {recentTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-full mr-3 ${
                            transaction.type === "credit" ? "bg-green-100" : "bg-red-100"
                          }`}>
                            {transaction.type === "credit" ? 
                              <ArrowDownLeft className="h-4 w-4 text-green-600" /> :
                              <ArrowUpRight className="h-4 w-4 text-red-600" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{transaction.date}</p>
                          </div>
                        </div>
                        <div className={`font-semibold ${
                          transaction.amount > 0 ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-24 flex-col"
                  onClick={() => setActiveTab("transfer")}
                >
                  <Send className="h-6 w-6 mb-2" />
                  Transfer Money
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Plus className="h-6 w-6 mb-2" />
                  Add Account
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <CreditCard className="h-6 w-6 mb-2" />
                  Pay Bills
                </Button>
                <Button 
                  variant="outline" 
                  className="h-24 flex-col"
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings className="h-6 w-6 mb-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "transfer" && <TransferMoney accounts={accounts} />}
        {activeTab === "history" && <TransactionHistory transactions={recentTransactions} />}
        
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences and security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <User className="h-4 w-4 mr-2" />
                  Profile Information
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Lock className="h-4 w-4 mr-2" />
                  Security Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Cards
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
