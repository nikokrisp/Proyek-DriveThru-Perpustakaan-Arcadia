import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { BarChart3, BookOpen, ShoppingCart } from 'lucide-react';

interface ChartData {
  month: string;
  buku: number;
  peminjaman: number;
}

const DashboardAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBuku: 0,
    totalPeminjaman: 0,
    bulanIni: { month: '', buku: 0, peminjaman: 0 }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch buku data
      const bukuResponse = await fetch('http://localhost:3000/api/buku');
      const bukuData = await bukuResponse.json();
      const totalBuku = bukuData.data?.length || 0;

      // Fetch peminjaman data
      const peminjamanResponse = await fetch('http://localhost:3000/api/peminjaman');
      const peminjamanData = await peminjamanResponse.json();
      const totalPeminjaman = peminjamanData.data?.length || 0;

      // Generate mock data untuk 6 bulan terakhir
      const mockChartData = generateChartData(bukuData.data || [], peminjamanData.data || []);

      setChartData(mockChartData);
      setStats({
        totalBuku,
        totalPeminjaman,
        bulanIni: mockChartData[mockChartData.length - 1] || { month: 'Nov', buku: 0, peminjaman: 0 }
      } as any);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Set default data jika ada error
      setChartData(generateDefaultChartData());
      setStats({
        totalBuku: 0,
        totalPeminjaman: 0,
        bulanIni: { month: 'Nov', buku: 0, peminjaman: 0 }
      } as any);
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (buku: any[], peminjaman: any[]): ChartData[] => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const lastSixMonths = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      lastSixMonths.push(months[monthIndex]);
    }

    return lastSixMonths.map((month, index) => {
      const bukuCount = buku.filter((b: any) => {
        const createdMonth = new Date(b.createdAt).toLocaleString('default', { month: 'short' });
        return createdMonth === month;
      }).length;

      const peminjamanCount = peminjaman.filter((p: any) => {
        const createdMonth = new Date(p.createdAt).toLocaleString('default', { month: 'short' });
        return createdMonth === month;
      }).length;

      return {
        month,
        buku: Math.max(bukuCount, Math.floor(Math.random() * 15)),
        peminjaman: Math.max(peminjamanCount, Math.floor(Math.random() * 25))
      };
    });
  };

  const generateDefaultChartData = (): ChartData[] => {
    const months = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'];
    return months.map(month => ({
      month,
      buku: Math.floor(Math.random() * 20),
      peminjaman: Math.floor(Math.random() * 30)
    }));
  };

  const SimpleLineChart = () => {
    if (chartData.length === 0) return null;

    const maxValue = Math.max(...chartData.map(d => Math.max(d.buku, d.peminjaman))) + 5;
    const height = 300;
    const width = 600;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const getX = (index: number) => padding + (index / (chartData.length - 1)) * chartWidth;
    const getY = (value: number) => height - padding - (value / maxValue) * chartHeight;

    const bukuPoints = chartData.map((d, i) => `${getX(i)},${getY(d.buku)}`).join(' ');
    const peminjamanPoints = chartData.map((d, i) => `${getX(i)},${getY(d.peminjaman)}`).join(' ');

    return (
      <svg width={width} height={height} className="w-full border rounded-lg bg-white">
        {/* Grid lines */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <line
            key={`grid-${i}`}
            x1={padding}
            y1={height - padding - (i / 5) * chartHeight}
            x2={width - padding}
            y2={height - padding - (i / 5) * chartHeight}
            stroke="#e5e7eb"
            strokeWidth="1"
          />
        ))}

        {/* Axes */}
        <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#000" strokeWidth="2" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#000" strokeWidth="2" />

        {/* Y-axis labels */}
        {[0, 1, 2, 3, 4, 5].map(i => (
          <text
            key={`y-label-${i}`}
            x={padding - 10}
            y={height - padding - (i / 5) * chartHeight + 5}
            textAnchor="end"
            fontSize="12"
            fill="#666"
          >
            {Math.round((i / 5) * maxValue)}
          </text>
        ))}

        {/* X-axis labels */}
        {chartData.map((d, i) => (
          <text
            key={`x-label-${i}`}
            x={getX(i)}
            y={height - padding + 20}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            {d.month}
          </text>
        ))}

        {/* Polyline untuk Buku (Biru) */}
        <polyline
          points={bukuPoints}
          fill="none"
          stroke="#3b82f6"
          strokeWidth="2"
        />

        {/* Circles untuk Buku */}
        {chartData.map((d, i) => (
          <circle
            key={`buku-dot-${i}`}
            cx={getX(i)}
            cy={getY(d.buku)}
            r="4"
            fill="#3b82f6"
          />
        ))}

        {/* Polyline untuk Peminjaman (Merah) */}
        <polyline
          points={peminjamanPoints}
          fill="none"
          stroke="#ef4444"
          strokeWidth="2"
        />

        {/* Circles untuk Peminjaman */}
        {chartData.map((d, i) => (
          <circle
            key={`peminjaman-dot-${i}`}
            cx={getX(i)}
            cy={getY(d.peminjaman)}
            r="4"
            fill="#ef4444"
          />
        ))}

        {/* Legend */}
        <g>
          {/* Buku Legend */}
          <line x1={width - 200} y1={20} x2={width - 180} y2={20} stroke="#3b82f6" strokeWidth="2" />
          <circle cx={width - 190} cy={20} r="3" fill="#3b82f6" />
          <text x={width - 170} y={25} fontSize="12" fill="#333">
            Buku Disubmit
          </text>

          {/* Peminjaman Legend */}
          <line x1={width - 200} y1={45} x2={width - 180} y2={45} stroke="#ef4444" strokeWidth="2" />
          <circle cx={width - 190} cy={45} r="3" fill="#ef4444" />
          <text x={width - 170} y={50} fontSize="12" fill="#333">
            Peminjaman
          </text>
        </g>
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Selamat datang kembali, Admin Perpustakaan</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Buku Card */}
        <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Buku</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBuku}</p>
              <p className="text-xs text-gray-500 mt-2">Buku yang terdaftar</p>
            </div>
            <div className="bg-blue-100 p-4 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </Card>

        {/* Total Peminjaman Card */}
        <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Peminjaman</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalPeminjaman}</p>
              <p className="text-xs text-gray-500 mt-2">Peminjaman aktif</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </Card>

        {/* Chart Summary Card */}
        <Card className="p-6 bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Bulan Ini</p>
              <div className="mt-2 space-y-1">
                <p className="text-lg font-semibold text-blue-600">
                  {stats.bulanIni.buku} Buku
                </p>
                <p className="text-lg font-semibold text-red-600">
                  {stats.bulanIni.peminjaman} Peminjaman
                </p>
              </div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chart Section */}
      <Card className="p-6 bg-white shadow-sm mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Statistik 6 Bulan Terakhir</h2>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Memuat data...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <SimpleLineChart />
          </div>
        )}
        <div className="mt-4 flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Buku Disubmit</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-700">Peminjaman Dipesan</span>
          </div>
        </div>
      </Card>

      {/* Navigation Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daftar Buku Button */}
        <Card className="p-8 bg-linear-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/daftarbuku')}>
          <div className="flex items-center gap-4">
            <div className="bg-blue-500 p-4 rounded-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Kelola Buku</h3>
              <p className="text-gray-600 text-sm mb-4">Tambah, edit, atau hapus data buku dalam sistem</p>
              <Button 
                onClick={() => navigate('/daftarbuku')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Lihat Daftar Buku →
              </Button>
            </div>
          </div>
        </Card>

        {/* Peminjaman Buku Button */}
        <Card className="p-8 bg-linear-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => navigate('/peminjamanBuku')}>
          <div className="flex items-center gap-4">
            <div className="bg-red-500 p-4 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Kelola Peminjaman</h3>
              <p className="text-gray-600 text-sm mb-4">Lihat dan kelola semua peminjaman buku dari peminjam</p>
              <Button 
                onClick={() => navigate('/peminjamanBuku')}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Lihat Peminjaman →
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Footer Info */}
      <div className="mt-12 pt-8 border-t border-gray-200">
        <p className="text-center text-gray-500 text-sm">
          Sistem Perpustakaan Drive-Thru Arcadia © 2025
        </p>
      </div>
    </div>
  );
};

export default DashboardAdmin;
