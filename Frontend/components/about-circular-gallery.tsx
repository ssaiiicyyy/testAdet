"use client";

import CircularGallery from "@/components/CircularGallery";

type GalleryItem = {
  image: string;
  text: string;
};

export function AboutCircularGallery({ items }: { items: GalleryItem[] }) {
  return (
    <CircularGallery
      items={items}
      bend={3}
      textColor="#ffffff"
      borderRadius={0.05}
      fontUrl={undefined}
      scrollEase={0.05}
      itemSize={1}
      itemAspect={0.78}
      gap={0.26}
      wave={1}
      fadeEdges={0.12}
      shadow={0.25}
      scrollSpeed={2}
      autoScroll={0}
      snap
      grayscale={false}
      showTitles
      openOnClick
      intro
      onItemClick={(item: GalleryItem, index: number) => {
        console.log(item.text, index);
      }}
      onActiveChange={() => undefined}
      dpr={undefined}
      style={undefined}
    />
  );
}
