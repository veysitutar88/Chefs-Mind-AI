import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartVisualizationProps {
  data: any[];
  type: string;
  title?: string;
}

export function ChartVisualization({ data, type, title = "Визуализация Данных" }: ChartVisualizationProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="h-64 bg-muted/30 rounded-lg flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <i className="fas fa-chart-line text-3xl mb-2"></i>
              <p className="text-sm">Нет данных для визуализации</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = data.map((item, index) => ({
    name: item[Object.keys(item)[0]] || `Item ${index + 1}`,
    value: parseFloat(item[Object.keys(item)[1]]) || 0,
    ...item
  }));

  const renderChart = () => {
    switch (type.toLowerCase()) {
      case 'bar':
      case 'column':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'line':
      default:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <Card className="bg-card border border-border" data-testid="chart-visualization">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center">
          <i className="fas fa-chart-line mr-2"></i>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderChart()}
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Интерактивный график • Созданный агентом Visualizer
        </p>
      </CardContent>
    </Card>
  );
}
