import { View } from 'react-native';

import { previewClubs } from '@/lib/discovery';

export function DiscoverMap() {
  return (
    <View className="relative h-[388px] overflow-hidden rounded-[26px] border border-border bg-[#11110f]">
      <View className="absolute inset-0 bg-[#141412]" />
      <View className="absolute inset-0 bg-[#191917]/80" />

      <View className="absolute inset-0">
        <View className="absolute left-[8%] top-[10%] h-[1px] w-[78%] rotate-[16deg] bg-white/8" />
        <View className="absolute left-[4%] top-[25%] h-[1px] w-[88%] -rotate-[8deg] bg-white/8" />
        <View className="absolute left-[10%] top-[44%] h-[1px] w-[72%] rotate-[9deg] bg-white/8" />
        <View className="absolute left-[14%] top-[60%] h-[1px] w-[68%] -rotate-[14deg] bg-white/8" />
        <View className="absolute left-[16%] top-[80%] h-[1px] w-[70%] rotate-[4deg] bg-white/8" />

        <View className="absolute left-[25%] top-[6%] h-[88%] w-[1px] rotate-[8deg] bg-white/8" />
        <View className="absolute left-[47%] top-[4%] h-[92%] -rotate-[7deg] border-l border-white/8" />
        <View className="absolute left-[66%] top-[8%] h-[80%] rotate-[14deg] border-l border-white/8" />

        <View className="absolute left-[34%] top-[14%] h-[210px] w-[210px] rounded-full border border-white/6" />
        <View className="absolute left-[28%] top-[8%] h-[250px] w-[250px] rounded-full border border-white/6" />
        <View className="absolute left-[22%] top-[2%] h-[290px] w-[290px] rounded-full border border-white/6" />
      </View>

      <View className="absolute left-[18%] top-[16%] h-[260px] w-[30px] rounded-full bg-[#233b5c]/65" />
      <View className="absolute left-[25%] top-[18%] h-[220px] w-[12px] rounded-full bg-white/5" />

      {previewClubs.map((club) => (
        <View
          key={club.id}
          className="absolute -ml-4 -mt-4 h-8 w-8 items-center justify-center rounded-full border border-white/12 bg-black/60"
          style={{ left: club.x, top: club.y }}>
          <View className="h-3.5 w-3.5 rounded-full bg-primary" />
        </View>
      ))}

      <View className="absolute left-[42%] top-[36%] -ml-8 -mt-8 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg shadow-black/30">
        <View className="h-7 w-7 rounded-full border-[3px] border-primary-foreground" />
      </View>
    </View>
  );
}
