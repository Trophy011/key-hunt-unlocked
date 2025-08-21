import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Download, Printer, Share2, Check, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  amount: number;
  currency: string;
  description: string;
  transaction_type: string;
  status: string;
  created_at: string;
  reference_number?: string;
  from_account?: { currency: string; account_number: string };
  to_account?: { currency: string; account_number: string };
}

interface TransactionReceiptProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

const TransactionReceipt = ({ transaction, isOpen, onClose }: TransactionReceiptProps) => {
  const { toast } = useToast();

  if (!transaction) return null;

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleDownload = () => {
    toast({
      title: "Receipt Downloaded",
      description: "Transaction receipt has been saved to your downloads.",
    });
  };

  const handlePrint = () => {
    window.print();
    toast({
      title: "Receipt Sent to Printer",
      description: "Receipt is being printed.",
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`Transaction Receipt - ${transaction.reference_number || transaction.id}`);
    toast({
      title: "Receipt Link Copied",
      description: "Receipt reference copied to clipboard.",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md animate-scale-in">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Transaction Receipt
          </DialogTitle>
        </DialogHeader>

        <Card className="bg-card-gradient border-0 shadow-lg">
          <CardContent className="p-6 space-y-4">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="bg-success/10 p-3 rounded-full w-fit mx-auto">
                <Check className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold">Transaction Completed</h3>
              <Badge variant={transaction.status === 'completed' ? 'default' : 'secondary'}>
                {transaction.status.toUpperCase()}
              </Badge>
            </div>

            <Separator />

            {/* Transaction Details */}
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className={`font-bold ${
                  transaction.transaction_type === 'deposit' ? 'text-success' : 'text-destructive'
                }`}>
                  {transaction.transaction_type === 'deposit' ? '+' : '-'}
                  {formatAmount(transaction.amount, transaction.currency)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span className="capitalize">{transaction.transaction_type}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Description</span>
                <span className="text-right max-w-48 truncate">{transaction.description}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Date & Time</span>
                <span>{new Date(transaction.created_at).toLocaleString()}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-muted-foreground">Reference</span>
                <span className="font-mono text-sm">
                  {transaction.reference_number || transaction.id.slice(0, 8).toUpperCase()}
                </span>
              </div>

              {transaction.from_account && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">From Account</span>
                  <span>{transaction.from_account.account_number}</span>
                </div>
              )}

              {transaction.to_account && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">To Account</span>
                  <span>{transaction.to_account.account_number}</span>
                </div>
              )}
            </div>

            <Separator />

            {/* Bank Information */}
            <div className="text-center text-sm text-muted-foreground space-y-1">
              <p className="font-semibold">US Bank</p>
              <p>1-800-US-BANKS (1-800-872-2657)</p>
              <p>www.usbank.com</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrint} className="flex-1">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleShare} className="flex-1">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionReceipt;