
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LucideIcon } from "lucide-react";

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  accountNumber: string;
  icon: LucideIcon;
}

interface AccountCardProps {
  account: Account;
}

const AccountCard = ({ account }: AccountCardProps) => {
  const Icon = account.icon;
  
  const getAccountTypeColor = (type: string) => {
    switch (type) {
      case "checking":
        return "bg-blue-100 text-blue-800";
      case "savings":
        return "bg-green-100 text-green-800";
      case "investment":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <Icon className="h-5 w-5 text-gray-600" />
          <CardTitle className="text-sm font-medium">{account.name}</CardTitle>
        </div>
        <Badge variant="secondary" className={getAccountTypeColor(account.type)}>
          {account.type}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-2">
          ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <CardDescription className="mb-4">
          Account {account.accountNumber}
        </CardDescription>
        <div className="flex space-x-2">
          <Button size="sm" variant="outline" className="flex-1">
            View Details
          </Button>
          <Button size="sm" className="flex-1">
            Transfer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountCard;
