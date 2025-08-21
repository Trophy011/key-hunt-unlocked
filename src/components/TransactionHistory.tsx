
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Search, Filter, Download, ArrowUpRight, ArrowDownLeft, Receipt } from "lucide-react";
import TransactionReceipt from "./TransactionReceipt";

interface BankTransaction {
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

interface TransactionHistoryProps {
  transactions: BankTransaction[];
}

const TransactionHistory = ({ transactions }: TransactionHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedTransaction, setSelectedTransaction] = useState<BankTransaction | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Convert bank transactions to the format expected by the component
  const allTransactions = transactions.map(transaction => ({
    id: transaction.id,
    description: transaction.description,
    amount: transaction.transaction_type === 'deposit' ? transaction.amount : -transaction.amount,
    date: transaction.created_at,
    type: transaction.transaction_type === 'deposit' ? 'credit' as const : 'debit' as const,
    currency: transaction.currency,
    status: transaction.status
  }));

  const filteredTransactions = allTransactions
    .filter(transaction => {
      const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterType === "all" || transaction.type === filterType;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      } else {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
    });

  const totalDebit = allTransactions
    .filter(t => t.type === "debit")
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCredit = allTransactions
    .filter(t => t.type === "credit")
    .reduce((sum, t) => sum + t.amount, 0);

  const handleTransactionClick = (transaction: BankTransaction) => {
    setSelectedTransaction(transaction);
    setIsReceiptOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <ArrowDownLeft className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +${totalCredit.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              -${totalDebit.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              totalCredit - totalDebit >= 0 ? "text-green-600" : "text-red-600"
            }`}>
              {totalCredit - totalDebit >= 0 ? "+" : ""}${(totalCredit - totalDebit).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            View and filter your transaction history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="credit">Income Only</SelectItem>
                <SelectItem value="debit">Expenses Only</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Transaction Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                 <TableRow>
                   <TableHead>Date</TableHead>
                   <TableHead>Description</TableHead>
                   <TableHead>Type</TableHead>
                   <TableHead>Status</TableHead>
                   <TableHead className="text-right">Amount</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const originalTransaction = transactions.find(t => t.id === transaction.id);
                  return (
                    <TableRow 
                      key={transaction.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors animate-fade-in"
                      onClick={() => originalTransaction && handleTransactionClick(originalTransaction)}
                    >
                      <TableCell className="font-medium">
                        {new Date(transaction.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {transaction.description}
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </TableCell>
                       <TableCell>
                         <Badge variant={transaction.type === "credit" ? "default" : "secondary"}>
                           {transaction.type === "credit" ? "Income" : "Expense"}
                         </Badge>
                       </TableCell>
                       <TableCell>
                         <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                           {transaction.status}
                         </Badge>
                       </TableCell>
                       <TableCell className={`text-right font-medium ${
                         transaction.amount > 0 ? "text-success" : "text-destructive"
                       }`}>
                         {transaction.amount > 0 ? "+" : ""}{Math.abs(transaction.amount).toFixed(2)} {transaction.currency}
                       </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredTransactions.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No transactions found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Receipt Modal */}
      <TransactionReceipt
        transaction={selectedTransaction}
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
      />
    </div>
  );
};

export default TransactionHistory;
