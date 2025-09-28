import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps {
  data: any[];
  title?: string;
}

export function DataTable({ data, title = "Результаты Запроса" }: DataTableProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">Нет данных для отображения</p>
        </CardContent>
      </Card>
    );
  }

  const columns = Object.keys(data[0]);

  const formatCellValue = (value: any) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'number') {
      // Format numbers with appropriate decimal places
      return new Intl.NumberFormat('ru-RU').format(value);
    }
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      // Format dates
      return new Date(value).toLocaleDateString('ru-RU');
    }
    return String(value);
  };

  return (
    <Card className="bg-card border border-border" data-testid="data-table">
      <CardHeader className="px-4 py-2 bg-muted border-b border-border">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {columns.map((column) => (
                  <TableHead 
                    key={column} 
                    className="px-4 py-2 text-left font-medium text-xs"
                    data-testid={`table-header-${column}`}
                  >
                    {column}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, index) => (
                <TableRow 
                  key={index} 
                  className="border-t border-border"
                  data-testid={`table-row-${index}`}
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column} 
                      className="px-4 py-2 text-sm"
                      data-testid={`table-cell-${index}-${column}`}
                    >
                      {formatCellValue(row[column])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
