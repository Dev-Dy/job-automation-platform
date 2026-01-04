'use client';

interface OverviewCardsProps {
  data: {
    newToday: number;
    totalApplied: number;
    totalReplied: number;
    responseRate: number;
  };
}

export default function OverviewCards({ data }: OverviewCardsProps) {
  const cards = [
    {
      title: 'New Today',
      value: data.newToday,
      borderColor: 'border-blue-500',
    },
    {
      title: 'Total Applied',
      value: data.totalApplied,
      borderColor: 'border-green-500',
    },
    {
      title: 'Replies Received',
      value: data.totalReplied,
      borderColor: 'border-purple-500',
    },
    {
      title: 'Response Rate',
      value: `${data.responseRate}%`,
      borderColor: 'border-orange-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div
          key={index}
          className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 ${card.borderColor} animate-fade-in`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <h3 className="text-sm font-medium text-gray-600 mb-2">{card.title}</h3>
          <p className="text-3xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
