// ts-client/src/pages/admin/Dashboard.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetAllPurchasesQuery } from "@/features/api/purchaseApi";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { PurchaseResponse, Purchase } from "@/types";

interface CourseSales {
  title: string;
  salesCount: number;
  totalRevenue: number;
}

interface ChartData {
  name: string;
  Revenue: number;
  Sales: number;
}

const Dashboard = (): JSX.Element => {
  const { data, isError, isLoading } = useGetAllPurchasesQuery();

  if (isLoading) return <h1>Loading Dashboard Data...</h1>;
  if (isError)
    return <h1 className="text-red-500">Failed to load sales data.</h1>;

  const { purchasedCourse = [] }: PurchaseResponse = data || { purchasedCourse: [] };

  // Aggregate the raw purchase data into a structured object
  const courseSalesData = purchasedCourse.reduce((acc: Record<string, CourseSales>, purchase: Purchase) => {
    const { courseId, courseTitle, amount } = purchase;

    // Initialize course entry if not seen before
    if (!acc[courseId]) {
      acc[courseId] = {
        title: courseTitle,
        salesCount: 0,
        totalRevenue: 0,
      };
    }

    // Convert amount to number and handle null/undefined
    const numericAmount = parseFloat(String(amount)) || 0;

    // Update sales count and revenue
    acc[courseId].salesCount += 1;
    acc[courseId].totalRevenue += numericAmount;

    return acc;
  }, {});

  // Convert aggregated object to chart data array
  const chartData: ChartData[] = Object.values(courseSalesData).map((course) => ({
    name: course.title,
    Revenue: course.totalRevenue,
    Sales: course.salesCount,
  }));

  // Calculate overall totals
  const overallTotalRevenue = chartData.reduce(
    (sum, course) => sum + course.Revenue,
    0
  );
  const overallTotalSales = chartData.reduce(
    (sum, course) => sum + course.Sales,
    0
  );

  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
      {/* Overall Total Sales Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Individual Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">
            {overallTotalSales}
          </p>
        </CardContent>
      </Card>

      {/* Overall Total Revenue Card */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader>
          <CardTitle>Total Gross Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-blue-600">
            ₹{overallTotalRevenue.toLocaleString()}
          </p>
        </CardContent>
      </Card>

      {/* Revenue Per Course Chart */}
      <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 col-span-1 sm:col-span-2">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-700">
            Revenue Per Course
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value: number) => `₹${value.toLocaleString()}`} />
              <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="Revenue"
                stroke="#8884d8"
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;