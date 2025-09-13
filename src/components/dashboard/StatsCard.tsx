interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: string;
  color: 'blue' | 'green' | 'pink' | 'orange' | 'purple' | 'yellow' | 'red';
}

const colorClasses = {
  blue: 'bg-blue-600 text-blue-400',
  green: 'bg-green-600 text-green-400',
  pink: 'bg-pink-600 text-pink-400',
  orange: 'bg-orange-600 text-orange-400',
  purple: 'bg-purple-600 text-purple-400',
  yellow: 'bg-yellow-600 text-yellow-400',
  red: 'bg-red-600 text-red-400',
};

export function StatsCard({ title, value, subtitle, icon, color }: StatsCardProps) {
  const colorClass = colorClasses[color];
  const [bgColor, textColor] = colorClass.split(' ');

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center">
      <div className={`${bgColor} rounded-full p-3 w-12 h-12 flex items-center justify-center mx-auto mb-4`}>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className={`text-3xl font-bold ${textColor} mb-2`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      <div className="text-gray-400 text-sm">{subtitle}</div>
    </div>
  );
}
